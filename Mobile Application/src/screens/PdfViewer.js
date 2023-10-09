import React, { Component } from 'react';
import { View, Text } from 'react-native';

import PDFReader from 'rn-pdf-reader-js'
import { styles, Header } from '../utils/utils';
import { BASE_URL } from '../utils/configs';

  
export default class PdfViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
        subjectID:this.props.navigation.state.params.item.id,
        title:this.props.navigation.state.params.item.title,
        url:this.props.navigation.state.params.item.url
    };
  }
  componentDidMount(){
    console.log(this.state)
  }

  render() {
    return (
      <View style={[styles.BG_STYLE]}>
          <Header title={this.state.title} backIcon={true} onbackIconPress={() => this.props.navigation.goBack()}  />
     
          <PDFReader
                    onError={(err) =>console.log(err)}
                    source={{
                      uri: `${BASE_URL}${this.state.url}`,
                    }}
                    customStyle={{position:'absolute',top:50}}
                    withScroll
                    onLoad={() => console.log(this.state.url)}
                  />
      </View>
    );
  }
}
