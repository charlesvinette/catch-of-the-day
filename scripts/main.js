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

//Firebase
let Rebase = require('re-base');
let base = Rebase.createClass('https://catch-of-the-day-78c5f.firebaseio.com/');
//React Catalyst
let Catalyst = require('react-catalyst');

/*
  App
*/

class App extends React.Component{
constructor(){
  super();
  this.state = {
      fishes: {},
      order: {},
  };
}

componentDidMount = () =>{
  base.syncState(this.props.params.storeId + '/fishes', {context:this, state:'fishes'});

  let localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);

  if (localStorageRef){
    this.setState({order: JSON.parse(localStorageRef)});
  };
}

componentWillUpdate = (nextProps,nextState) =>{
  localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order))
}

addToOrder = (key)=>{
 this.state.order[key] = this.state.order[key] + 1 || 1;
 this.setState({order:this.state.order});
}

addFish = (fish)=>{
  let timeStamp = (new Date()).getTime();
  //Update the state
  this.state.fishes['fish-' + timeStamp] = fish;
  //Set the state
  this.setState({fishes: this.state.fishes});
}

loadSamples = ()=>{
  this.setState({fishes:require('./sample-fishes')});
}

renderFish = (key) =>{
  return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder}/>
}
  render(){
    return(
      <div className= "catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Good"/>
          <ul className="listOfFishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes} order={this.state.order}/>
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} setState={this.setState}/>
      </div>
    )
  }
}

/*
  Fish Component
*/

class Fish extends React.Component{
  onButtonClick = ()=>{
    console.log("Going to add the fish:", this.props.index);
    this.props.addToOrder(this.props.index);
  }
  render(){
    let details = this.props.details;
    let isAvailable = (details.status === 'available' ? true : false);
    let buttonText = (isAvailable ? 'Add to Order' : 'Sold out!');
    return(
      <li className="menu-fish">
        <img src={details.image} alt ={details.name}/>
        <h3 className="fish-name">
          {details.name}
          <span className="price">{helpers.formatPrice(details.price)}</span>
        </h3>
        <p>{details.desc}</p>
        <button disabled={!isAvailable} onClick={this.onButtonClick}>{buttonText}</button>
      </li>
    )
  }
}

/*
  Add Fish form
*/

class AddFishForm extends React.Component{
  createFish = (event)=>{
    event.preventDefault()
    let fish = {
      name: this.refs.name.value,
      price: this.refs.price.value,
      status: this.refs.status.value,
      desc: this.refs.desc.value,
      image:  this.refs.image.value,
    }
    this.props.addFish(fish);
    this.refs.fishform.reset()
  }
  render(){
    return (
      <form className="fish-edit" ref="fishform" onSubmit={this.createFish}>
        <input type="text" ref="name" placeholder="Fish Name"/>
        <input type="text" ref="price" placeholder="Fish Price"/>
        <select ref="status">
          <option value="available">Fresh!</option>
          <option value="soldOut">Sold out</option>
        </select>
        <textarea type="text" ref="desc" placeholder="Desc"/>
        <input type="text" ref="image" placeholder="URL to image"/>
        <button type="submit">+ Add Item</button>
      </form>
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
  renderOrder = (key)=>{
    let fish = this.props.fishes[key];
    let count = this.props.order[key];

    if (!fish){
      return <li key={key}>Sorry, fish no longer available</li>
    }
    return (
      <li key={[key]}>
        {count} lbs {fish.name}
        <span className="price">{helpers.formatPrice(count * fish.price)}</span>
      </li>);
  }
  render(){
    let orderIds = Object.keys(this.props.order);
    let total = orderIds.reduce((prevTotal,key) =>{
      let fish = this.props.fishes[key];
      let count = this.props.order[key];
      let isAvailable = fish && fish.status === 'available';

      if (fish && isAvailable){
        return prevTotal + (count * parseInt(fish.price) || 0);
      }
      return prevTotal;
    }, 0)

    return(
      <div className="order-wrap">
        <h2 className="order-title">Your Order</h2>
        <ul className="order">
        {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Total:</strong>
            {helpers.formatPrice(total)}
          </li>
        </ul>
      </div>
    )
  }
}

/*
  Inventory
*/

class Inventory extends React.Component{
  handleModification = (key, value)=>{
    this.props.fishes[key].name = value
    this.props.setState({fishes: this.props.fishes})
    console.log(this.props.fishes[key]);
  }
  renderInventory = (key)=>{
    return(
      <div className="fish-edit" key={key}>
        <input type="text" value={this.props.fishes[key].name} onChange={(event)=>this.handleModification(key, event.target.value)}/>
      </div>
    )
  }
  render(){
    return(
      <div>
        <h2>Inventory</h2>
        {Object.keys(this.props.fishes).map(this.renderInventory)}
        <AddFishForm {...this.props}/>
        <button onClick={this.props.loadSamples}> Load Sample Fishes</button>
      </div>
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
