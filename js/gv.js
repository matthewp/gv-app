(function() {
  var Watch, LoginManager;
 
  function exists(obj) {
    return typeof obj !== "undefined" && obj !== null;
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

      var list = new MessageList('sms');
      list.getMessages();

      return;
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
    getMessages: function(e) {
      this._elem.innerHTML = "Loading messages";
      
      var xhr = new XMLHttpRequest();
      xhr.open('POST', this._endpoint, true);
      xhr.onreadystatechange = this.showMessages.bind(this);
      xhr.send(localStorage['gc-auth']);
    },

    showMessages: function(e) {
      if(e.target.readyState === 4) {
        var node = this._elem;
        var xml = e.target.responseXML;
        var json = xml.childNodes[0].childNodes[1].textContent;
        var messages = JSON.parse(json)['messages'];
        if(messages)
          node.innerHTML = '';

        Object.keys(messages).forEach(function(key) {
          var msg = messages[key];
          var elem = document.createElement('div');
          elem.id = msg.id;
          elem.className = 'message';

          var from = document.createElement('div');
          from.className = 'from';
          from.innerHTML = msg.phoneNumber;
          var content = document.createElement('div');
          content.className = 'content';
          content.innerHTML = msg.messageText;
          var when = document.createElement('div');
          when.className = 'when';
          var st = new Date(msg.displayStartDateTime);
          when.innerHTML = (st.getMonth() + 1) + '/' + st.getDate();

          elem.appendChild(from);
          elem.appendChild(content);
          elem.appendChild(when);

          node.appendChild(elem);
        });
      }
    }
  };

	window.addEventListener('load', function winLoad() {
		window.removeEventListener('load', winLoad);
		Watcher.init();
	});

})();
