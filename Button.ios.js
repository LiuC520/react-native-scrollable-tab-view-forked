const React = require('react');
const ReactNative = require('react-native');
const {
  View,
  TouchableOpacity
} = ReactNative;

const Button = (props) => {
  return <TouchableOpacity {...props}>
    {props.children}
  </TouchableOpacity>;
};

module.exports = Button;
