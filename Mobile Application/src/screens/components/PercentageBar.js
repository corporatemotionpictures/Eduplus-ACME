import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";


const PercentageBar = ({ starText, percentage, totalreview }) => {
    const [animation] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(animation, {
      toValue: percentage,
      duration: 500,
    }).start();
  }, [percentage]);
    return (
      <View style={{ flexDirection: "row", marginLeft:10}}>
        <Text style={styles.progressText}>{starText}</Text>
        <View style={styles.progressMiddle}>
          <View style={styles.progressWrap}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: animation.interpolate({
                inputRange: [0, totalreview],
                outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
          </View>
        </View>
        <Text style={styles.progressPercentText}>{percentage}</Text>
      </View>
    );
  };

  export default PercentageBar;

  const styles = StyleSheet.create({
    progressText: {
        width: 10,
        fontSize: 14,
        color: "#07A1E8",
      },
      progressPercentText: { width: 60, fontSize: 14, color: "#323357" },
      progressMiddle: {
        height: 10,
        flex: 1,
        marginHorizontal: 10,
      },
      progressWrap: {
        backgroundColor: "#F5F8FF",
        borderRadius: 18,
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        padding: 2,
      },
      progressBar: {
        flex: 1,
        shadowOffset: { width: 0, height: 0 },
        shadowColor: "#ffcc48",
        shadowOpacity: 1.0,
        shadowRadius: 4,
        backgroundColor: "#FFCC48",
        borderRadius: 18,
        minWidth: 5,
      },
  });