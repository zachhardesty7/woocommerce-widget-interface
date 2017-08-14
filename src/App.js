import React, { Component } from 'react';
import './App.css';

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
      completed: false,
      hidden: []
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
    this.setState({type: e.target.value, focus: 1})
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
            hidden={this.state.hidden}
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
      let filtered = this.filterData();

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
        if (!this.props.hidden.includes(key)) {
          this.props.onChange('hidden')([...this.props.hidden, key])
        }
      }
      let hiddenIndex = this.props.hidden.indexOf(key);
      if (hiddenIndex !== -1 && value === 'false') {
        this.props.onChange('hidden')([
          ...this.props.hidden.slice(0, hiddenIndex), ...this.props.hidden.slice(hiddenIndex + 1)
        ])
      }
      // if new index equals new focus (plus offset)
      // inc index
      if (newIndex === newFocus + 1)
        this.props.onChange('index')(newIndex);
      // inc focus and output w/ +1 to offset -1 on input
      this.props.onChange('focus')(newFocus + 1 + 1);
      if (newIndex === filtered.length)
        this.props.onChange('completed')(true);
      // update output code snippet (App state)
      this.props.onChange(key)(value);
    };
  }
  filterData = () => {
    const modes = {
      express: [0],
      custom: [0,5,6,7,8],
      advanced: [0,1,2,3,4,5,6,7,8]
    }
    // filter data to proper fields for given mode
    const filtered = this.props.data.filter((field, i) => {
      return (modes[this.props.type].includes(i));
    })
    return filtered;
  }
  handleClick = (focus, index) => {
    if (this.props.focus !== index)  {
      this.props.onChange('focus')(index + 1);
    }
  }
  render() {
    // filter prop data by prop type
    const filtered = this.filterData();
    // then map prop data to components
    let options = filtered.map((field, i) => {
      if (field.type === 'affiliate') {
        return (
          <Affiliate
            key={field.key}
            default=''
            onChange={this.handleChange(field.key)}
            onClick={this.handleClick}
            index={i}
            focus={this.props.focus}
            // focusRef={elem => this.focusElement = elem}
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
            onClick={this.handleClick}
            hidden={this.props.hidden.includes(field.id)}
            index={i}
            focus={this.props.focus}
          />
        )
      } else if (field.type === 'binary') {
        return (
          <InputField
            key={field.key}
            name={field.name}
            type={field.type}
            onChange={this.handleChange(field.id)}
            onClick={this.handleClick}
            index={i}
            focus={this.props.focus}
          />
        )
      } else if (field.type === 'text') {
        return (
          <InputField
            key={field.key}
            name={field.name}
            type={field.type}
            onChange={this.handleSizeChange}
            onClick={this.handleClick}
            hidden={this.props.hidden.includes(field.id)}
            index={i}
            focus={this.props.focus}
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
  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }
  handleSizeChange = (key) => {
    return (e) => {
      this.props.onChange(key)(e.target.value);
    }
  }
  handleClick = (e) => {
    this.props.onClick(this.props.focus, this.props.index);
  }
  render() {
    if (this.props.hidden) return null;
    const focus = this.props.index === this.props.focus? 'focus' : 'blur';
    if (this.props.type === 'dropdown') {
      let options = this.props.values.map((value, i) =>
        <option key={value} value={value.toLowerCase()}>{value}</option>
      );
      if (this.props.default !== 'hidden') {
        options.unshift(<option key={this.props.default} value={this.props.default}>Choose {this.props.name}</option>);
      }
      return (
        <div onMouseDown={this.handleClick} className={this.props.name.toLowerCase() + ' ' + focus}>
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
        <div onMouseDown={this.handleClick} className={this.props.name.toLowerCase() + ' ' + focus}>
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
        <div onMouseDown={this.handleClick} className={this.props.name.toLowerCase() + ' ' + focus}>
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
  handleChange = (e) => {
    this.props.onChange(e.target.value);
  }
  handleClick = () => {
    this.props.onClick(this.props.focus, this.props.index);
  }
  render() {
    const focus = this.props.index === this.props.focus ? 'focus' : 'blur';
    return(
      <div onMouseDown={this.handleClick} ref={this.props.focusRef} className={'affiliates ' + focus}>
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
      </div>
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
