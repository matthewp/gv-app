(function() {
  var Watch, LoginManager;
  
  Watcher = {
    init: function() {
      if(localStorage['auth'] === null) {
        var self = this;
        var lf = new LoginForm();
        lf.complete = function() {
          lf.close();
          self.init();
        };
        return;
      }
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
        localStorage.auth = xhr.responseText;
        this.complete();
      }
    }
  };

	function getSms(e) {
		var elem = document.getElementById('messages');
		elem.innerHTML = "Loading messages";
		
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'api/sms', true);
		xhr.onreadystatechange = showSms;
		xhr.send(localStorage.auth);
	}

	function showSms(e) {
		if(e.target.readyState === 4) {
      var node = document.getElementById('messages');
			var xml = e.target.responseXML;
      var json = xml.childNodes[0].childNodes[1].textContent;
      var messages = JSON.parse(json)['messages'];

      Object.keys(messages).forEach(function(key) {
        var msg = messages[key];
        var elem = document.createElement('div');
        elem.innerHTML = msg.messageText;
        node.appendChild(elem);
      });
		}
	}

	window.addEventListener('load', function winLoad() {
		window.removeEventListener('load', winLoad);
		Watcher.init();
	});

})();
