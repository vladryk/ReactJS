import React, { Component } from 'react';
// import ReactDOM from 'react';
// import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

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
            <LoginForm isAuthorized={true} loginFunc={this.login} />
         </div>
      );
   },
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
        this.onClick = this.onClick.bind(this);
    };

    handleUsername(e) {
        this.setState({username: e.target.value});
    }

    handlePassword(e) {
        this.setState({password: e.target.value});
    }

    checkAuthorize() {
        $.ajax({
            url: '/auth/user/',
            type: 'GET',
            success: function(resp) {
                this.setState({authorized: true});
            }.bind(this)
        });
    }

    onClick () {
        // console.log("sdfsd");
     $.ajax({
      url: '/',
      type: 'POST',
      data: {
        username: this.state.username,
        password: this.state.password,
      },
        success: function(resp) {
          this.setState({authorized: true});
          // this.setState({})
        }.bind(this)
      // beforeSend: function () {
      //   this.setState({loading: true});
      // }.bind(this)
    })}


  render() {

    return (
    // {/*<button onClick={this.onSubmit}> </button >*/}
        <div className={this.state.authorized? '' : ''}>
        <div className="container">
            <label><b>Username
            <input type="text" placeholder="Enter Username" name="uname" value={this.state.username} onChange={this.handleUsername} required />
        </b></label>

        <label><b>Password
        <input type="password" placeholder="Enter Password" name="psw" value={this.state.password} onChange={this.handlePassword} required />
        </b></label>

        <button type="submit" onClick={this.onClick}>Login</button>

        </div>
            <span className="psw"><a href="#">Create account</a></span>
        </div>

    );
  }
}


export default App;


