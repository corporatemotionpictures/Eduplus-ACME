import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, TouchableOpacity } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import { BG_COLOR, BLUE, Header, LIGHTGREY,GREEN,WIDTH } from '../../utils/utils';


export default function SelectableItems(props) {
    const [data, setData] = useState(props.data);
    const [selectedItems, setSelectedItems] = useState(data[0])
    const handleSelect = (item) =>{
        setSelectedItems(item);
    }

    const renderItems = ({item,index}) =>{
        return (
            <TouchableOpacity style={{ width:widthPercentageToDP(35), padding:10, margin:5, color: 'grey', borderColor: LIGHTGREY, }} >
            <View>
                {/* <Text onPress={() => handleSelect(item)}  style={{margin:heightPercentageToDP(2),color:selectedItems.id == item.id ? "blue":'black',borderColor: 'grey', borderWidth: .8, borderRadius: 4, padding: 10, marginBottom: 0, fontSize: 12,justifyContent:'center', alignItems:'center', textAlign:'center',}}>{item.title}</Text> */} 
                <Text onPress={() => handleSelect(item)} numberOfLines={2} style={{ color: selectedItems.id == item.id  ? 'white' : LIGHTGREY, backgroundColor:selectedItems.id == item.id ? BLUE : 'white',  borderColor: LIGHTGREY, borderWidth: .8, borderRadius: 4, padding: 14, marginBottom: 0, fontSize: 12,justifyContent:'center', alignItems:'center', textAlign:'center' }}>{item.title}</Text>
            </View>
          </TouchableOpacity>
                //<Text onPress={() => handleSelect(item)} numberOfLines={2} style={{ color: selectedItems.id == item.id  ? LIGHTGREY : LIGHTGREY, backgroundColor:selectedItems.id == item.id ? 'white' : 'white',  borderColor: LIGHTGREY, borderWidth: .8, borderRadius: 4, padding: 14, marginBottom: 0, fontSize: 12,justifyContent:'center', alignItems:'center', textAlign:'center' }}>{item.title}</Text>
        )
    }

    useEffect(() =>{
        props.onChange(selectedItems);
    },[selectedItems]);

    return (
        <View style={{marginTop:heightPercentageToDP(-2)}}>
            {/* {data.length == 0 ? <Text style={{color:'black', fontSize:10, textAlign:'center'}}>No Variant Available</Text>: */}
                <FlatList 
                    renderItem={renderItems}
                    data={data}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
        </View>
    )
}
