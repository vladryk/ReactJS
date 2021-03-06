import React, { Component } from 'react';
// import ReactDOM from 'react';
// import logo from './logo.svg';
import './App.css';
import $ from 'jquery';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Grid  from 'react-bootstrap/lib/Grid';
import Row  from 'react-bootstrap/lib/Row';
import Col  from 'react-bootstrap/lib/Col';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Table from 'react-bootstrap/lib/Table';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';

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
		while (c.charAt(0)===' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}


var App = React.createClass({
    getInitialState: function() {
        return {
            authorized: false,
            data: [],
        };
    },

    login: function() {
        this.setState({authorized: true,});
        this.ExpensesFromServer();
    },

    logout: function () {
        this.setState({authorized: false,});
        createCookie('csrftoken', '', 1);
    },


    ExpensesFromServer: function () {
        $.ajax({
            url: 'api/expenses/',
            dataType: 'json',
            cache: false,
            type: 'GET',
            beforeSend: function (xhr) {
                var token = readCookie('csrftoken');
                if (token == null) {
                    token = ''
                }
                xhr.setRequestHeader ("Authorization", "Token " + token);
            },
            success: function (data) {
                console.log("expenses from server success", data);
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.log(xhr);
            }
        });
    },
    handleLimit: function (limit) {
        var date = new Date(Date.now());
        var sum = 0;
        var elength = this.state.data.length;
        for (var i = 0; i < elength; i++) {
            var old_date = new Date(this.state.data[i].date);
            if (old_date.toLocaleDateString() === date.toLocaleDateString()) {
                sum += this.state.data[i].cost;
            }
        }
        var day_limit = limit.limit;
        if (!day_limit) {
            return 'empty';
        }
        else if (sum <= day_limit) {
            return 'isLess';
        }
        return 'isGreater';
    },
    handleExpensesFilter: function (filter) {
        if (!filter.text && !filter.datefrom && !filter.dateto && !filter.timefrom && !filter.timeto){
            this.ExpensesFromServer();
            return
        }
        var new_data = this.state.data;
        var data = [];
        var elength = this.state.data.length;
        for (var i = 0; i < elength; i++) {
            if (new_data[i].date >= filter.datefrom && new_data[i].date <= filter.dateto &&
                new_data[i].time >= filter.timefrom && new_data[i].time <= filter.timeto &&
                new_data[i].text.search(filter.text) !== -1) {
                data.push(new_data[i]);
            }
        }
        this.setState({data: data});
    },
    handleExpenseEdit: function (expense) {
        var that = this;
        $.ajax({
            url: 'api/expenses/' + expense.id + '/',
            dataType: 'json',
            type: 'PATCH',
            beforeSend: function (xhr) {
                var token = readCookie('csrftoken');
                if (token == null) {
                    token = ''
                }
                xhr.setRequestHeader ("Authorization", "Token " + token);
            },
            data: expense,
            success: function (data) {
                var new_data = that.state.data;
                var elength = that.state.data.length;
                for (var i = 0; i < elength; i++) {
                    if (that.state.data[i].id === data.id) {
                        new_data[i].text = data.text;
                        new_data[i].time = data.time;
                        new_data[i].date = data.date;
                        new_data[i].cost = data.cost;
                        break;
                    }
                }
                that.setState({data: new_data});
            },
            error: function (xhr, status, err) {
                console.log(xhr);
            }
        });
    },
    handleExpenseSubmit: function (expense) {
        var expenses = this.state.data;
        var that = this;
        $.ajax({
            url: 'api/expenses/',
            dataType: 'json',
            type: 'POST',
            beforeSend: function (xhr) {
                var token = readCookie('csrftoken');
                if (token == null) {
                    token = ''
                }
                xhr.setRequestHeader ("Authorization", "Token " + token);
            },
            data: expense,
            success: function (data) {
                that.setState({data: expenses.concat(data)});
            },
            error: function (xhr, status, err) {
                console.log(xhr);
            }
        });
    },
    handleExpenseRemove: function (expense) {
        var index = -1;
        var elength = this.state.data.length;
        for (var i = 0; i < elength; i++) {
            if (this.state.data[i].id === expense.id) {
                index = i;
                break;
            }
        }
        var data = this.state.data[index];
        var that = this;

        $.ajax({
            url: 'api/expenses/' + expense.id + '/',
            dataType: 'json',
            beforeSend: function (xhr) {
                var token = readCookie('csrftoken');
                if (token == null) {
                    token = ''
                }
                xhr.setRequestHeader ("Authorization", "Token " + token);
            },
            type: 'DELETE',
            data: data,
            success: function (data) {
                that.state.data.splice(index, 1);
                that.setState({data: that.state.data});
            },
            error: function (xhr, status, err) {
                console.log(xhr);
            }
        });
    },

    render: function() {
      return (
         <div className="container">
             <div className={this.state.authorized? 'hidden' : ''}>
                <LoginForm loginFunc={this.login}/>
             </div>

             <div className={this.state.authorized?"":"hidden"}>
                 <Navbar>
                     <Navbar.Header>
                        <Navbar.Brand>
                            <a href="#">Expenses</a>
                        </Navbar.Brand>
                     </Navbar.Header>
                    <Nav>
                        <ButtonToolbar>
                            <Button type="submit" bsStyle="primary" bsSize="normal" onClick={this.logout} className="btn btn-primary btn-lg pull-right">Logout</Button>
                        </ButtonToolbar>
                        {/*<button type="submit" onClick={this.logout}>Logout</button>*/}
                    </Nav>
                 </Navbar>

                 <h3 className="text-center">List of Expenses</h3>
                    <ExpensesList data={this.state.data} onExpenseDelete={this.handleExpenseRemove}
                                  onExpenseEdit={this.handleExpenseEdit} isAuthorized={this.state.authorized} />
                    <div className="row">

                        <Col xs={6} md={4}>
                            <h3 className="text-center">Expense Create</h3>
                            <ExpensesForm onExpenseSubmit={this.handleExpenseSubmit}/>
                        </Col>

                        <Col xs={6} md={4}>
                            <h3 className="text-center">Filter of Expenses</h3>
                            <ExpensesFilterForm onExpensesFilter={this.handleExpensesFilter}/>
                        </Col>

                        <Col xs={6} md={4}>
                            <h3 className="text-center" >Limit of Expenses</h3>
                            <ExpensesLimit onLimit={ this.handleLimit }/>
                        </Col>
                    </div>
             </div>
         </div>
      );
   },
});


var ExpensesList = React.createClass({
    handleExpenseRemove: function (e) {
        this.props.onExpenseDelete(e);
    },
    handleExpenseEdit: function (e) {
        this.props.onExpenseEdit(e);
    },

    render: function () {
        var that = this;
        console.log("expenses: ", this.props.data);
        var expenseNodes = this.props.data.map(function (expense) {
            return (
                <Expense date={expense.date} time={expense.time} cost={expense.cost} id={expense.id} key={expense.id}
                         onDelete={that.handleExpenseRemove} onEdit={that.handleExpenseEdit}>
                    {expense.text}
                </Expense>
            )
        });

        return (

                <div className={this.props.isAuthorized? '' : 'hidden'}>

                        <div className="expensesList">
                            <br/>
                            <Table striped bordered condensed hover>
                                <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Text</th>
                                    <th>Cost</th>
                                    <th>Remove</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {expenseNodes}
                                </tbody>
                            </Table>
                        </div>

                </div>
        );
    }
});


var ExpensesFilterForm = React.createClass({
    getInitialState: function () {
        return {datefrom: '', dateto: '', timefrom: '', timeto: '', text: ''};
    },
    handleDateFromChange: function (e) {
        this.setState({datefrom: e.target.value});
    },
    handleDateToChange: function (e) {
        this.setState({dateto: e.target.value});
    },
    handleTimeFromChange: function (e) {
        this.setState({timefrom: e.target.value});
    },
    handleTimeToChange: function (e) {
        this.setState({timeto: e.target.value});
    },
    handleTextChange: function (e) {
        this.setState({text: e.target.value});
    },
    handleFilter: function (e) {
        var text = this.state.text;
        var datefrom = this.state.datefrom;
        var dateto = this.state.dateto;
        var timefrom = this.state.timefrom;
        var timeto = this.state.timeto;
        // if (!text && !datefrom && !dateto && !timefrom && !timeto) {
        //     return;
        // }
        this.props.onExpensesFilter({
            datefrom: datefrom,
            dateto: dateto,
            timefrom: timefrom,
            timeto: timeto,
            text: text
        });
        this.setState({datefrom: '', dateto: '', timefrom: '', timeto: '', text: ''});
    },
    render: function () {
        return (
            <form>
                <br/>
                <input type="date"
                       className="form-control"
                       placeholder="DateFrom"
                       value={this.state.datefrom}
                       onChange={this.handleDateFromChange}/>
                <br/>
                <input type="date"
                       className="form-control"
                       placeholder="DateTo"
                       value={this.state.dateto}
                       onChange={this.handleDateToChange}/>
                <br/>
                <input type="time"
                       className="form-control"
                       placeholder="TimeFrom"
                       value={this.state.timefrom}
                       onChange={this.handleTimeFromChange}/>
                <br/>
                <input type="time"
                       className="form-control"
                       placeholder="TimeTo"
                       value={this.state.timeto}
                       onChange={this.handleTimeToChange}/>
                <br/>
                <input type="text"
                       className="form-control"
                       placeholder="Your text"
                       value={this.state.text}
                       onChange={this.handleTextChange}/>
                <br/>
                <ButtonToolbar>
                    <Button type="button" value="Filter" bsStyle="success" onClick={this.handleFilter}>Filter</Button>
                </ButtonToolbar>
            </form>
        );
    }
});

var ExpensesForm = React.createClass({
    getInitialState: function () {
        return {date: '', time: '', text: '', cost: ''};
    },
    handleDateChange: function (e) {
        this.setState({date: e.target.value});
    },
    handleTimeChange: function (e) {
        this.setState({time: e.target.value});
    },
    handleTextChange: function (e) {
        this.setState({text: e.target.value});
    },
    handleCostChange: function (e) {
        this.setState({cost: e.target.value});
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var text = this.state.text.trim();
        var date = this.state.date;
        var time = this.state.time;
        var cost = this.state.cost;
        if (!text || !date || !time || !cost) {
            return;
        }
        this.props.onExpenseSubmit({date: date, time: time, text: text, cost: cost});
        this.setState({date: '', time: '', text: '', cost: ''});
    },
    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <br/>
                <input type="date"
                       className="form-control"
                       placeholder="Date"
                       value={this.state.date}
                       onChange={this.handleDateChange}/>
                <br/>
                <input type="time"
                       className="form-control"
                       placeholder="Time"
                       value={this.state.time}
                       onChange={this.handleTimeChange}/>
                <br/>
                <input type="text"
                       className="form-control"
                       placeholder="Say something..."
                       value={this.state.text}
                       onChange={this.handleTextChange}/>
                <br/>
                <input type="number"
                       className="form-control"
                       placeholder="Cost"
                       value={this.state.cost}
                       onChange={this.handleCostChange}/>
                <br/>
                <ButtonToolbar>
                    <Button type="submit" value="Save" bsStyle="success">Save</Button>
                </ButtonToolbar>
                {/*<input type="submit" value="Save"/>*/}
            </form>
        );
    }
});

var ExpensesLimit = React.createClass({
    getInitialState: function () {
        return {limit: ''};
    },
    handleLimitChange: function (e) {
        this.setState({limit: e.target.value});
    },
    render: function () {
        return (
            <div className={this.props.onLimit({limit: this.state.limit})}>
                <br/>
                <input type="number" className="form-control" value={ this.state.limit }
                       onChange={this.handleLimitChange}/>
            </div>
        );
    }
});


var Expense = React.createClass({
    handleDateChange: function (e) {
        this.handleExpenseEdit({
            text: this.props.text,
            date: e.target.value,
            time: this.props.time,
            cost: this.props.cost,
            id: this.props.id
        });
    },
    handleTimeChange: function (e) {
        this.handleExpenseEdit({
            text: this.props.text,
            date: this.props.date,
            time: e.target.value,
            cost: this.props.cost,
            id: this.props.id
        });
    },
    handleTextChange: function (e) {
        this.handleExpenseEdit({
            text: e.target.value,
            date: this.props.date,
            time: this.props.time,
            cost: this.props.cost,
            id: this.props.id
        });
    },
    handleCostChange: function (e) {
        this.handleExpenseEdit({
            text: this.props.text,
            date: this.props.date,
            time: this.props.time,
            cost: e.target.value,
            id: this.props.id
        });
    },
    handleExpenseEdit: function (expense) {
        this.props.onEdit(expense);
        return false;
    },
    handleExpenseRemove: function () {
        this.props.onDelete({
            id: this.props.id,
            date: this.props.date,
            time: this.props.time,
            text: this.props.children,
            cost: this.props.cost
        });
        return false;
    },
    render: function () {
        return (
            <tr>
                <td>
                    <FormGroup bsSize="normal">
                        <FormControl type="date" value={this.props.date} onChange={this.handleDateChange} />
                    </FormGroup>
                </td>

                <td>
                    <FormGroup bsSize="normal">
                        <FormControl type="time" value={this.props.time} onChange={this.handleTimeChange} />
                    </FormGroup>
                </td>

                <td>
                    <FormGroup bsSize="normal">
                        <FormControl type="text" value={this.props.children} onChange={this.handleTextChange} />
                    </FormGroup>
                </td>

                <td>
                    <FormGroup bsSize="normal">
                        <FormControl type="number" value={this.props.cost} onChange={this.handleCostChange} />
                    </FormGroup>
                </td>

                <td>
                    <ButtonToolbar>
                            <Button type="button" value="Remove" onClick={this.handleExpenseRemove} >Remove</Button>
                    </ButtonToolbar>
                </td>

            </tr>
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

  render() {

    return (
          <Grid>
              <Row className="show-grid">
                  <Col xs={6} md={4}></Col>

                    <Col xs={6} md={4}>

                        <FormGroup bsSize="large">
                            <FormControl type="text" placeholder="Enter Username" name="uname" value={this.state.username} onChange={this.handleUsername} required />
                            <FormControl type="password" placeholder="Enter Password" name="psw" value={this.state.password} onChange={this.handlePassword} required />
                        </FormGroup>

                        <ButtonToolbar>
                            <Button type="submit" bsStyle="primary" bsSize="large" onClick={this.handleLogin}>Login</Button>
                        </ButtonToolbar>

                        <span className="psw"><a href="#">Create account</a></span>

                    </Col>
                  <Col xs={6} md={4}></Col>
              </Row>
          </Grid>
    );
  }
}


export default App;


