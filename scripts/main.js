let React = require('react');
let ReactDOM = require('react-dom');
let ReactRouter = require('react-router');
let Router = ReactRouter.Router;
let Route = ReactRouter.Route;
let withRouter = ReactRouter.withRouter;
let Navigation = ReactRouter.Navigation;
let History = ReactRouter.History;
let browserHistory = ReactRouter.browserHistory;
let helpers = require('./helpers');

/*
  App
*/

class App extends React.Component{

  render(){
    return(
      <div className= "catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Good"/>
        </div>
        <Order />
        <Inventory />
      </div>
    )
  }
}

/*
  Header
*/

class Header extends React.Component{
  render(){

    return(
      <header className = "top">
        <h1>Catch
          <span className="ofThe">
            <span className="of">of</span>
            <span className="the">the</span>
          </span>
            Day</h1>
        <h3 className ="tagline"><span>{this.props.tagline}</span></h3>
      </header>
    )
  }
}

/*
  Order
*/

class Order extends React.Component{
  render(){
    return(
      <p>Order</p>
    )
  }
}

/*
  Inventory
*/

class Inventory extends React.Component{
  render(){
    return(
      <p>Inventory</p>
    )
  }
}

/*
  Store Picker Component
  This will let us make <StorePicker>
*/

class StorePicker extends React.Component{
  goToStore = (event) =>{
    event.preventDefault();
    //Get the data from the input
    let storeId = this.refs.storeId.value;
    console.log(storeId)
    //Transition from StorePicker to the App
    console.log('/store/' + storeId);
    this.props.router.push('/store/' + storeId);
  }
  render(){
    let name = "Charles";
    return(
      <form className="store-selector" onSubmit={this.goToStore}>
        {/*Creating the store*/}
        <h2> Please enter a store {name} </h2>
        <input type="text" ref="storeId" defaultValue={helpers.getFunName()} required/>
        <input type="Submit" value="Submit" readOnly="true"/>
      </form>
    )
  }
}
var storePickerWithRouter = withRouter(StorePicker)
/*
  Not Found Component
*/

class NotFound extends React.Component{
  render(){
    return(
      <h1>Not Found!</h1>
    )
  }
}

/*
  Routes
*/

let routes = (
  <Router history={browserHistory}>
    <Route path="/" component={storePickerWithRouter}/>
    <Route path="/store/:storeId" component={App}/>
    <Route path="*" component={NotFound}/>
  </Router>
)

ReactDOM.render(routes, document.getElementById('main'));