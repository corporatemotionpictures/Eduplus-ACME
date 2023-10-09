import * as React from 'react';
import { Text } from 'react-native';

export default props => 
<Text {...props} 
style={[{fontFamily: 'Roboto-Regular'}, props.style]}>
    {props.children}
    </Text>
