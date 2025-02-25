import React,{ Component } from 'react';
import './checkin.css';
import {history} from "./../../utils/util";
import * as UTIL from './../../utils/util';
import {Redirect} from 'react-router';
import * as VALIDATION from './../../utils/validation';
import {BASE_URL} from './../../components/Configs/Configs.js';
import {Link} from 'react-router-dom';
import axios from 'axios';
import Header from './../header/header.js';

class Checkin extends Component {
  constructor(props){
    super(props);
    this.state = {
      bookingDetails : [],
      current : 1,
      itemsPerPage : 2,
      activePage: 1,
    }
    this.userCheckin = this.userCheckin.bind(this);
    this.userCheckout = this.userCheckout.bind(this);
    this.userBookingCancel = this.userBookingCancel.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler(event) {
      this.setState({
          current: Number(event.target.id)
      });
    }

  componentDidMount() {
    var email = UTIL.getUserDetails();
    if(email) {
      axios.get(BASE_URL + '/api/fetchBooking/' + email)
       .then((response) => {
          console.log("response", response)
          if(response.status == 200)
          {
              this.setState({
                bookingDetails : this.state.bookingDetails.concat(response.data)
              })
          }
      });
    }
    else {
      alert("First login as guest to checkin..!!!")
    }
  }
  userCheckin(data) {
    if(data.booking_cancelled) {
      alert("User booking has been cancelled");
    }
    else if(data.user_checked_out_flag) {
      alert("User already checked out");
    }
    if(data.user_checked_in_flag) {
          alert("User already checked in");
    }
    else {
          data.user_checked_in_flag = true;
          data.no_show = false;
          data.amount_paid = data.price;
          data.user_check_out_date = "";
          console.log("DATA SENT : " +JSON.stringify(data));
          this.updateBooking(data,function alertFunc(){
          });
        }
    }

  userCheckout(data) {
    console.log("user_checked_out_flag : " +data.user_checked_out_flag);
    console.log("user_checked_in_flag : " +data.user_checked_in_flag);
      if(data.booking_cancelled) {
        alert("User can not check in.!! Your booking was cancelled");
      }
      else if(data.user_checked_in_flag && !data.user_checked_out_flag) {
        this.updateBooking(data,function alertFunc(){
           alert("User checked out successfully");
        });
      }
      else {
        alert("Either user is not checked in or already checkout out");
      }
  }

  userBookingCancel(data) {
    if(data.booking_cancelled) {
      alert("Your booking was already cancelled");
    }
    else if(data.user_checked_out_flag) {
      alert("Your booking can not be cancelled.!! Already checked out.!!");
    }
    else {
      data.booking_cancelled = true;
      this.cancelBooking(data,function alertFunc(){
         alert("Your booking has been cancelled");
      });
    }
  }
  updateBooking(data, callback) {
    fetch(`${BASE_URL}/api/checkinout`, {
           method: 'POST',
           mode: 'cors',
           headers: { ...UTIL.getUserHTTPHeader(),'Content-Type': 'application/json' },
           body: JSON.stringify(data)
         }).then(response => {
            console.log("Status Code : ",response);
            if(response.status==200) {
              alert("User checked in successfully");
             window.location.reload();
            return response.json();
          }
          else if(response.status == 406) {
            alert("User is not allowed to check-in");
          }
        }).then(result => {
          console.log("Updating booking details Results:",result);
          callback();
        })
    .catch(error => {
      console.log("Error : " + error);
    });

  }

  cancelBooking(data, callback) {
    fetch(`${BASE_URL}/api/cancelbooking`, {
           method: 'POST',
           mode: 'cors',
           headers: { ...UTIL.getUserHTTPHeader(),'Content-Type': 'application/json' },
           body: JSON.stringify(data)
         }).then(response => {
            console.log("Status Code : ",response);
            if(response.status==200) {
             window.location.reload();
            return response.json();
          }
        }).then(result => {
          console.log("Updating booking details Results:",result);
          callback();
        })
    .catch(error => {
      console.log("Error : " + error);
    });

  }

  render() {
    const { current, itemsPerPage } = this.state;
    const indexOfLastPage = current * itemsPerPage;
    const indexOfFirstPage = indexOfLastPage - itemsPerPage;
    const currentTodos = this.state.bookingDetails.slice(indexOfFirstPage, indexOfLastPage);
    console.log("Number of properties : " + this.state.bookingDetails.length);
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(this.state.bookingDetails.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }
    const showPageNumbers1 = pageNumbers.map(number => {
        return (
          <li class="page-item active"
            key={number}
            id={number}
            onClick={this.clickHandler}
            className="nums"
          >
      {number}
          </li>
        );
      });
            let bookingInfo = currentTodos.map(bookingItem => {
                return (
                    <div className="checkin-class">
                    <div class="row">
                    <button onClick= {() => this.userCheckin(bookingItem)} type="submit" className="btn btn-primary checkin">CHECK-IN</button>
                    <br/>
                    <button onClick= {() => this.userCheckout(bookingItem)} type="submit" className="btn btn-primary checkout">CHECK-OUT</button>
                    <br/><br/>
                    <button onClick= {() => this.userBookingCancel(bookingItem)} type="submit" className="btn btn-primary cancel">CANCEL BOOKING</button>
                    <div class="col-sm-7" className="bookColor_dash_list">
                      <ul class="list-inline">
                        <li>Booking ID : {bookingItem.id}</li>
                        <br></br>
                        <li>Property ID : { bookingItem.propertyId}</li>
                        <br></br>
                        <li>Total Bill for Stay: $ {bookingItem.price}</li>
                        <br></br>
                        <li>Reservation Start Date : {bookingItem.check_in_date}</li>
                        <br></br>
                        <li>Reservation End Date : {bookingItem.check_out_date}</li>
                        <br></br>
                      </ul>
                    </div>
                    </div>
                    </div>
                  );
    });
    console.log("Booking details on success page : " +this.state.bookingDetails);
    return (
              <div>
                <Header/>
                  <div className="booking-result-class">
                      <h>{this.state.bookingDetails.length}
                          {this.state.bookingDetails.length <= 1 ? " RESULT " : " RESULTS "}  FOUND
                      </h></div>
                      <div>
                          {bookingInfo}
                      </div>
                      <br/>
                      <div className="prop_pagi">
                      <nav aria-label="Page navigation example">
                      <ul class="pagination">
                      {showPageNumbers1}
                      </ul>
                      </nav>
                      </div>
                  <div></div>
              </div>
           );
  }
}
export default Checkin;
