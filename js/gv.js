/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function() {
  'use strict';
  var Watcher, LoginManager, Contacts, Conversation;
 
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB
    || window.msIndexedDB || window.oIndexedDB;

  String.prototype.toPhoneNumber = function() {
    var n = this.replace(/\D/g, '');
    if(n.length === 10)
      n = '1' + n;

      return n;
  }

  function exists(obj) {
    return typeof obj !== "undefined" && obj !== null;
  }

  function openDb(callback, context) {
    const DB_NAME = 'gvapp';
    const DB_VERSION = 1;

    var req = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    req.onupgradeneeded = function(e) {
      var db = e.target.result;
      var stores = ['contacts'];
      stores.forEach(function(store) {
        if(!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store); // TODO Need to index this.
        }
      });
    };

    req.onsuccess = context
      ? callback.bind(context)
      : callback;

    req.onerror = function(err) {
      console.log('Error opening database: ' + err);
    };
  }

  Watcher = {
    init: function() {
      if(!exists(localStorage['gc-auth']) || !exists(localStorage['cp-auth'])) {
        var self = this;
        var lf = new LoginForm();
        lf.complete = function() {
          lf.close();
          self.init();
        };
        return;
      }

      Contacts.load();
      
      var list = new MessageList('sms');
      list.getMessages();

      window.addEventListener('unload', this.unload);

      return;
    },

    unload: function() {
      // TODO cleanup when the window is unloading.
    }
  };

  function LoginForm() {
    this._view = document.getElementsByClassName('login-area')[0];
    this._view.className += ' active';

    document.getElementById('login-form')
      .addEventListener('submit', this.formSubmitted.bind(this), false);
  }

  LoginForm.prototype = {
    formSubmitted: function(e) {
      e.preventDefault();
      var email = document.getElementsByName('email')[0].value;
      var password = document.getElementsByName('password')[0].value;
      this.logIn(email, password);
    },

    close: function() {
      this._view.className = 'login-area';
    },

    logIn: function(email, password) {
      var info = { "email": email, "password": password };

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'api/login', true);
      xhr.onreadystatechange = this.loggingIn.bind(this);
      xhr.send(JSON.stringify(info));
    },

    loggingIn: function(e) {
      if(e.target.readyState === 4) {
        var xhr = e.target;
        var info = JSON.parse(xhr.responseText);
        localStorage['email'] = info.email;
        localStorage['gc-auth'] = info.grandcentral;
        localStorage['cp-auth'] = info.cp;
        this.complete();
      }
    }
  };

  function MessageList(type) {
    this._endpoint = 'api/' + type;
    this._elem = document.getElementById('messages');
  }

  MessageList.prototype = {
    messages: [],

    getMessages: function(e) {
      this._elem.innerHTML = "Loading messages";
      
      var xhr = new XMLHttpRequest();
      xhr.open('POST', this._endpoint, true);
      xhr.onreadystatechange = this.showMessages.bind(this);
      xhr.send(localStorage['gc-auth']);
    },

    showMessages: function(e) {
      if(e.target.readyState === 4) {
        var self = this;
        var node = self._elem;
        var xml = e.target.responseXML;
        var json = xml.childNodes[0].childNodes[1].textContent;
        var messages = JSON.parse(json)['messages'];
        if(messages)
          node.innerHTML = '';

        Object.keys(messages).forEach(function(key) {
          var data = messages[key];
          self.createNode(data);
        });
    },

    createNode: function(data) {
      var msg = new Message(data);
      this._elem.appendChild(msg.node);

      this.messages.push(msg);
    },

    updateContacts: function() {
      // TODO search the database for the contact
      
    }
  };

  function Message(json) {
    this.id = json.id;
    this.phoneNumber = json.phoneNumber;
    this.text = json.messageText;
    this.when = json.displayStartDateTime;
  }

  Message.prototype = {
    id: 0,

    set phoneNumber: function(p) {
      this._number = p;
    },

    get phoneNumber: function() {
      return this._number.toPhoneNumber();
    },

    text: '',

    set when: function(t) {
      this._when = new Date(t);
    },

    get when: function() {
      var w = this._when;
      return (w.getMonth() + 1) + '/' + w.getDate();
    },

    get node: function() {
      if(this._node)
        return this._node;

      var elem = document.createElement('div');
      elem.id = this.id;
      elem.className = 'message';

      var from = document.createElement('div');
      from.className = 'from';
      from.innerHTML = this.phoneNumber;
      var content = document.createElement('div');
      content.className = 'content';
      content.innerHTML = this.text;
      var when = document.createElement('div');
      when.className = 'when';
      when.innerHTML = this.when;

      elem.appendChild(from);
      elem.appendChild(content);
      elem.appendChild(when);

      elem.addEventListener('click', this.show.bind(this));
      
      this._node = elem;
      return this._node;
    },

    show: function() {
      // TODO This code isn't working. How do we know
      // which messages are part of a conversation?
      var conv = new Conversation();
      conv.show();
    }

  };

  Contacts = {
    load: function(page) {
      page = page || 1;
      var info = {
        email: localStorage['email'],
        auth: localStorage['cp-auth'],
        page: page
      };

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'api/contacts', true);
      xhr.onreadystatechange = this.loaded.bind(this, page);
      xhr.send(JSON.stringify(info));
    },

    loaded: function(page, e) {
      if(e.target.readyState === 4) {
        var cont = false;

        var xhr = e.target;
        var xml = xhr.responseXML;

        var nodes = xml.getElementsByTagName('entry');
        if(nodes) {
          cont = true;
          nodes = Array.prototype.slice.call(nodes);
        }

        if(!exists(this._db)) {
          openDb(function(e) {
            this._db = e.target.result;
            this._save(nodes);

            if(cont) {
              page++;
              this.load(page);
            }
          }, this);
        } else {
          this._save(nodes);

          if(cont) {
            page++;
            this.load(page);
          }
        }
      }

      setTimeout(this.load.bind(this), 3600000); // Load again in an hour.
    },

    show: function(node) {
      // TODO find the contact in the document
    },

    complete: function() { },

    _save: function(node) {
      if(node instanceof Array) {
        var self = this;
        node.forEach(function(n) {
          self._save(n);
        });

        return;
      }

      var phones = node.getElementsByTagName('gd:phoneNumber');
      if(phones.length === 0)
        return;

      var contact = new Contact(node);
      var obs = '';
      // TODO save this contact to the database.
    },
  };

  function Contact(node) {
    this.phones = (function() {
      var arr = [];
      var phones = node.getElementsByTagName('gd:phoneNumber');
      phones = Array.prototype.slice.call(phones);
      phones.forEach(function(phone) {
        arr.push(phone.textContent.toPhoneNumber());
      });

      return arr;
    })();

    this.name = node.getElementsByTagName('title')[0].textContent;
  }

  Contact.prototype = {
    phones: [],
    name: ''
  }

  function Conversation(msg) {
    this._elem = document.getElementById('conversation');
  }

  Conversation.prototype = {
    show: function() {
      // TODO Show the conversation items.
      this._elem.className += ' active';
    }
  };

  window.addEventListener('load', function winLoad() {
    window.removeEventListener('load', winLoad);
    Watcher.init();
  });

})();
