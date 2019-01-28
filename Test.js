/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DragAndDropAnimation from './DragAndDropAnimation';

export default class App extends Component {

    state = {
        orderList: [0, 1, 2, 3, 4, 5],
        data: ['List 1', 'List 2', 'List 3', 'List 4', 'List 5', 'List 6'],
    }

    render() {
        const { orderList, data } = this.state;

        return (
            <View style={styles.container}>
                <DragAndDropAnimation
                    orderList={ orderList }
                    onOrderListChanged={(newOrderList) => {
                        this.setState({
                            orderList: [...newOrderList],
                        });
                    }}
                    activeItemBackgroundColor="red"
                    data={ data }
                    renderItem={(itemKey) => {
                        return (
                            <Text>
                                { data[itemKey] }
                            </Text>
                        );
                    }}
                />

                <TouchableOpacity style={{ marginTop: 100 }} onPress={() => {
                    this.setState({
                        orderList: [5, 4, 3, 2, 1, 0],
                    });
                }}>
                    <Text>
                        order
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
});
