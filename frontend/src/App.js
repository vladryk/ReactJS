import React, { Component } from 'react';
// import ReactDOM from 'react';
// import logo from './logo.svg';
import './App.css';
import $ from 'jquery';


// functions bellow come from http://www.quirksmode.org/js/cookies.html

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <div className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h2>Welcome to React</h2>
//         </div>
//         <p className="App-intro">
//           To get started, edi1аываыва11t <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }


// class LoginForms extends React.Component {
//
//    constructor(props) {
//       super(props);
//
//       this.state = {
//          data: ''
//       };
//
//       this.updateState = this.updateState.bind(this);
//
//    };
//
//    updateState(e) {
//       this.setState({data: e.target.value});
//    }
//
//    render() {
//       return (
//          <div>
//             <input type="text" value={this.state.data}
//                onChange={this.updateState} />
//             <h4>{this.state.data}</h4>
//          </div>
//       );
//    }
// }


var App = React.createClass({
    getInitialState: function() {
        return {
            authorized: false,
        };
    },

    login: function() {
        this.setState({authorized: true,});
    },

    render: function() {
      return (
         <div>
            <LoginForm isAuthorized={this.state.authorized} loginFunc={this.login} />
            <ExpensesList isAuthorized={this.state.authorized} />
         </div>
      );
   },
});


var ExpensesList = React.createClass({

    render: function () {
        return (
            <div className={this.props.isAuthorized? '' : 'hidden'}>
                <div className="expensesList">
                    <br/>
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Text</th>
                            <th>Cost</th>
                        </tr>
                        </thead>
                        <tbody>
                            {/*Some Data*/}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

class LoginForm extends Component {

    componentDidMount() {
        this.checkAuthorize();
    };

    constructor(props) {
        super(props);
        this.state = {username: '',
                      password: '',
                      authorized: false,
                      };
        this.handleUsername = this.handleUsername.bind(this);
        this.handlePassword = this.handlePassword.bind(this);
        // this.onClick = this.onClick.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.checkAuthorize = this.checkAuthorize.bind(this);
    };

    handleUsername(e) {
        this.setState({username: e.target.value});
    }

    handlePassword(e) {
        this.setState({password: e.target.value});
    }

    checkAuthorize() {
        $.ajax({
            url: '/api/expenses/',
            type: 'GET',
            beforeSend: function (xhr) {
                var token = readCookie('csrftoken');
                if (token == null) {
                    token = ''
                }
                xhr.setRequestHeader ("Authorization", "Token " + token);
            },
            statusCode: {
              401: function (response) {
                 // alert('1');
                 this.setState({authorized: false});
                 createCookie('csrftoken', '', 1);
              }.bind(this)
            },
            success: function(resp) {
                // alert('2');
                this.setState({authorized: true});
                this.props.loginFunc();
            }.bind(this)
        });
    }

    handleLogin () {
        var data = {username: this.state.username, password: this.state.password};
        $.ajax({
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            // beforeSend: function (xhr) {
            //     xhr.setRequestHeader('X-CSRFToken', readCookie('csrftoken'));
            // },
            url: 'api-token-auth/',
            type: 'POST',
            data: data,
            success: function (data) {
                this.setState({username: '', password: '', authorized: true});
                this.setState({authorized: true});
                createCookie('csrftoken', data.token, 1);
                this.props.loginFunc();
            }.bind(this),
            error: function (xhr, status, err) {
                console.log(xhr);
            },
        });
    }

    // onClick () {
    //  $.ajax({
    //   url: '/',
    //   type: 'POST',
    //   data: {
    //     username: this.state.username,
    //     password: this.state.password,
    //   },
    //     success: function(resp) {
    //       this.setState({authorized: true});
    //       this.setState({})
    //     }.bind(this)
    //   beforeSend: function () {
    //     this.setState({loading: true});
    //   }.bind(this)
    // })}


  render() {

    return (
        <div className={this.state.authorized? 'hidden' : ''}>
        <div className="container">
            <label><b>Username
            <input type="text" placeholder="Enter Username" name="uname" value={this.state.username} onChange={this.handleUsername} required />
        </b></label>

        <label><b>Password
        <input type="password" placeholder="Enter Password" name="psw" value={this.state.password} onChange={this.handlePassword} required />
        </b></label>

        <button type="submit" onClick={this.handleLogin}>Login</button>

        </div>
            <span className="psw"><a href="#">Create account</a></span>
        </div>

    );
  }
}


export default App;


