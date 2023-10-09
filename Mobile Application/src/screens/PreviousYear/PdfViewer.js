import React, { Component } from 'react';
import { View } from 'react-native';
import { styles, Header } from '../../utils/utils';
import PDFReader from 'rn-pdf-reader-js';
import { BASE_URL } from '../../utils/configs';

  
export default class PdfViewer extends Component {


  constructor(props){
    super(props);
    this.state={
      subjectID:this.props.navigation.state.params.item.id,
      title:this.props.navigation.state.params.item.title,
      url:this.props.navigation.state.params.item.url
    }

  }
  render() {
    return (
      <View style={styles.BG_STYLE}>
      <Header  backIcon={true} onbackIconPress={() => this.props.navigation.goBack()}  title={this.state.title} rightIcon="" />
            
            <PDFReader
              withScroll
              //onError={(err) =>Alert.alert("Whoops!  We are having some temporary connection issue. Please try after sometime.")}
              // source={{
              //   uri: `http://www.africau.edu/images/default/sample.pdf`,
              // }}
              source={{
                uri: `${BASE_URL}${this.state.url}`,
              }}
              onLoad={() => console.log(this.state.url)}
            />
           
            </View>
    );
  }
}
