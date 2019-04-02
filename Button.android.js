
import {TouchableOpacity} from 'react-native'

const React = require('react')

const Button = props => (
  <TouchableOpacity
    delayPressIn={0}
    {...props}
  >
    {props.children}
  </TouchableOpacity>
)

module.exports = Button
