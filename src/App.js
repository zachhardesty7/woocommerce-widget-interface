import React, { Component } from 'react';
import './App.css';

// TODO:
/*******
 *  lift 'hidden' state to 'App' for consistency
 *  remove useless constructors / convert to pure functions
 *  implement focus indicator
 *  fix focusing wrong elements
 *  styling duh
 */

const data = [
  {
    type: 'affiliate',
    key: 'affiliate'
  },
  {
    type: 'dropdown',
    key: 'page',
    name: 'Page',
    values: ['Store', 'Product', 'Cart'],
    default: 'Store'
  },
  {
    type: 'dropdown',
    key: 'category',
    name: 'Category',
    values: ['Category1', 'Category2', 'Category3'],
    default: 'available'
  },
  {
    type: 'dropdown',
    key: 'tag',
    name: 'Tag',
    values: ['Tag1', 'Tag2', 'Tag3'],
    default: ''
  },
  {
    type: 'dropdown',
    key: 'productId',
    name: 'Product ID',
    values: ['12345', '12234', '11123'],
    default: ''
  },
  {
    type: 'binary',
    key: 'columnsCheckbox',
    id: 'columns',
    name: 'Dynamic Columns'
  },
  {
    type: 'dropdown',
    key: 'columnsField',
    id: 'columns',
    name: 'Columns',
    values: ['1', '2', '3', '4', '6', '12'],
    default: 'dynamic'
  },
  {
    type: 'binary',
    key: 'sizeCheckbox',
    id: 'size',
    name: 'Dynamic Size'
  },
  {
    type: 'text',
    key: 'sizeField',
    id: 'size',
    name: 'Size Field'
  }
]

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'store',
      affiliate: '',
      category: 'available',
      tag: '',
      productId: '',
      columns: 'dynamic',
      size: 'dynamic',
      index: 0,
      focus: 0,
      type: '',
      completed: false
    };
  }
  handleChange = (key) => {
    return (value) => {
      var update = {};
      update[key] = value;
      this.setState(update);
    };
  }
  handleTypeChangeClick = (e) => {
    this.setState({type: e.target.value})
    this.setState({focus: 1})
  }
  handleReset = () => {
    this.setState({index: 0, focus: 0, completed: false})
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src='https://markporterlive.com/wp-content/uploads/MPL-Logo-Transparent-optimized.png' className="App-logo" alt="logo" />
          <h2>Choose Settings Below to Create an Embed Code</h2>
        </div>
        {this.state.focus === 0 &&
          <div>
            <div>Installation Type</div>
            <div>
              <button onClick={this.handleTypeChangeClick} value='express'>Express</button>
              <button onClick={this.handleTypeChangeClick} value='custom'>Custom</button>
              <button onClick={this.handleTypeChangeClick} value='advanced'>Advanced</button>
            </div>
          </div>
        }
        {this.state.focus >= 1 &&
          <Build
            data={data}
            onChange={this.handleChange}
            index={this.state.index}
            // -1 for easier calculations inside build function
            // output changing focus +1 back to offset
            focus={this.state.focus - 1}
            type={this.state.type}
          />
        }
        <div>
          <button onClick={this.handleReset}>Reset Options</button>
        </div>
        {this.state.completed &&
          <Output
            page={this.state.page}
            affiliate={this.state.affiliate}
            category={this.state.category}
            tag={this.state.tag}
            productId={this.state.productId}
            columns={this.state.columns}
            size={this.state.size}
          />
        }
      </div>
    );
  }
}

class Build extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: []
    };
  }
  handleSizeChange = (key) => {
    return (e) => {
      this.setState({[key]: e.target.value});
      let size;
      key === 'width' ? size = e.target.value + ',' + this.state.height : size = this.state.width + ',' + e.target.value;
      this.props.onChange('size')(size);
    };
  }
  handleChange = (key) => {
    return (value) => {

      // TODO: abstract -----------------------------
      const modes = {
        express: [0],
        custom: [0,5,6,7,8],
        advanced: [0,1,2,3,4,5,6,7,8]
      }
      // filter data to proper fields for given mode
      const filtered = this.props.data.filter((field, i) => {
        return (modes[this.props.type].includes(i));
      })
      // ---------------------------------------------

      // FIXME: returning -1 for fields when using ID vs key
      let newFocus = filtered.findIndex((field) => {
        return field.key === key;
      })
      //        very hacky solution
      if (newFocus === -1) {
        newFocus = filtered.findIndex((field) => {
          return field.id === key;
        })
      }

      let newIndex = this.props.index + 1;
      if (value === 'dynamic') {
        newIndex++;
        newFocus++;
        if (!this.state.hidden.includes(key)) {
          this.setState({ hidden: [...this.state.hidden, key] });
        }
      }
      let hiddenIndex = this.state.hidden.indexOf(key);
      if (hiddenIndex !== -1 && value === 'false') {
        this.setState({
          hidden: [
            ...this.state.hidden.slice(0,hiddenIndex), ...this.state.hidden.slice(hiddenIndex+1)
          ]
        });
      }
      // if new index equals new focus (plus offset)
      // inc index
      if (newIndex === newFocus + 1)
        this.props.onChange('index')(newIndex);
      // inc focus and output w/ +1 to offset -1 on input
      this.props.onChange('focus')(newFocus + 1 + 1);
      if (newIndex === filtered.length)
        this.props.onChange('completed')(true)
      // update output code snippet (App state)
      this.props.onChange(key)(value);
    };
  }
  handleFocus = () => {
    return this.props.index === this.props.focus;
  }
  render() {

    // TODO: abstract -----------------------------
    const modes = {
      express: [0],
      custom: [0,5,6,7,8],
      advanced: [0,1,2,3,4,5,6,7,8]
    }
    // filter data to proper fields for given mode
    const filtered = this.props.data.filter((field, i) => {
      return (modes[this.props.type].includes(i));
    })
    // ---------------------------------------------

    // then map data to react components
    const options = filtered.map((field, i) => {
      if (field.type === 'affiliate') {
        return (
          <Affiliate
            key={field.key}
            default=''
            onChange={this.handleChange(field.key)}
            focus={this.handleFocus()}
          />
        )
      } else if (field.type === 'dropdown') {
        return (
          <InputField
            key={field.key}
            name={field.name}
            type={field.type}
            values={field.values}
            default=''
            onChange={this.handleChange(field.key)}
            focus={this.handleFocus()}
            hidden={this.state.hidden.includes(field.id)}
          />
        )
      } else if (field.type === 'binary') {
        return (
          <InputField
            key={field.key}
            name={field.name}
            type={field.type}
            onChange={this.handleChange(field.id)}
            focus={this.handleFocus()}
          />
        )
      } else if (field.type === 'text') {
        return (
          <InputField
            key={field.key}
            name={field.name}
            type={field.type}
            onChange={this.handleSizeChange}
            focus={this.handleFocus()}
            hidden={this.state.hidden.includes(field.id)}
          />
        )
      } else {
        console.error('error');
        return null;
      }
    })
    let output = [];
    for (let i = 0; i <= this.props.index; i++) {
      output.push(options[i]);
    }
    return(
      <div>
        {output}
      </div>
    )
  }
}

class InputField extends Component {
  constructor(props) {
    super(props);
  }
  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }
  handleSizeChange = (key) => {
    return (e) => {
      this.props.onChange(key)(e.target.value);
    }
  }
  render() {
    if (this.props.hidden) return null;
    if (this.props.type === 'dropdown') {
      let options = this.props.values.map((value, i) =>
        <option key={value} value={value.toLowerCase()}>{value}</option>
      );
      if (this.props.default !== 'hidden') {
        options.unshift(<option key={this.props.default} value={this.props.default}>Choose {this.props.name}</option>);
      }
      return (
        <div className={this.props.name.toLowerCase()}>
          <label>
            {this.props.name + ': '}
            <select onChange={this.handleChange}>
              {options}
            </select>
          </label>
        </div>
      )
    } else if (this.props.type === 'binary') {
      return(
        <div className={this.props.name.toLowerCase()}>
          <label>
            {this.props.name + ': '}
          </label>
          <button value='dynamic' onClick={this.handleChange}>
            Yes
          </button>
          <button value={false} onClick={this.handleChange}>
            No
          </button>
        </div>
      )
    } else if (this.props.type === 'text') {
      return (
        <div className={this.props.name.toLowerCase()}>
          <label>
            Width (px):
            <input type="text" name="size" onChange={this.handleSizeChange('width')} />
          </label>
          <label>
            Height (px):
            <input type="text" name="size" onChange={this.handleSizeChange('height')} />
          </label>
        </div>
      )
    }
  }
}

class Affiliate extends Component {
  constructor(props) {
    super(props);
  }
  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }
  render() {
    return(
      <label>
        Affiliate:
        <select onChange={this.handleChange}>
          <option value=''>Choose Affiliate</option>
          <option value="markporter">Mark Porter</option>
          <option value="dan-hamilton">Dan Hamilton</option>
          <option value="tar">Texas Association of Realtors</option>
          <option value="kar">Kansas Association of Realtors</option>
        </select>
      </label>
    );
  }
}

class Output extends Component {
  render() {
    let output = '<script language="JavaScript" type="text/javascript" src="https://dev.markporterlive.com/wp-content/plugins/woocommerce-widget/woocommerce-widget-client-script.js" async></script><div id="wc-widget" data-widget="' + this.props.page + '" data-affiliate="' + this.props.affiliate + '" data-category="' + this.props.category + '" data-tag="' + this.props.tag + '" data-product-id="' + this.props.productId + '" data-size="' + this.props.size + '" data-columns="' + this.props.columns + '"></div>'
    return (
      <div>
        <code>
          {output}
        </code>
      </div>
    );
  }
}

export default App;
