import React, { PureComponent } from 'react';
import { View } from 'react-native';
import _ from 'lodash';

import DraggableItem from './DraggableItem';


class DragAndDropAnimation extends PureComponent {

    state = {
        activeItemHeight: -1,
        activeItemIndex: -1,
        activeItemNextIndex: -1,
    }

    move(orderList, oldIndex, newIndex) {
        const movableItem = orderList.splice(oldIndex, 1)[0];

        const preArray = orderList.slice(0, newIndex);
        const postArray = orderList.slice(newIndex, orderList.length);
        const newArray = [...preArray, movableItem, ...postArray];

        return newArray;
    }

    renderItem(itemKey, itemIndex) {
        const { orderList, renderItem,activeItemBackgroundColor } = this.props;
        const { activeItemHeight, activeItemIndex, activeItemNextIndex } = this.state;

        return (
            <DraggableItem
                key={ itemKey }
                index={ itemIndex }
                orderLength={ orderList.length || 0 }
                activeItemBackgroundColor={ activeItemBackgroundColor || 'gray' }

                activeItemHeight={ activeItemHeight }
                activeItemIndex={ activeItemIndex }
                activeItemNextIndex={ activeItemNextIndex }

                onItemPressed={(itemHeight) => {
                    this.setState({
                        activeItemIndex: itemIndex,
                        activeItemNextIndex: itemIndex,
                        activeItemHeight: itemHeight,
                    });
                }}
                onActiveItemNextIndexChanged={(currentIndex) => {
                    this.setState({
                        activeItemNextIndex: currentIndex,
                    });
                }}
                onActiveItemReleased={() => {
                    let nextOrderList = null;

                    this.setState((prevState) => {
                        const { orderList } = this.props;
                        const { activeItemIndex, activeItemNextIndex } = prevState;
                        nextOrderList = this.move(orderList, activeItemIndex, activeItemNextIndex);

                        return {
                            activeItemHeight: -1,
                            activeItemIndex: -1,
                            activeItemNextIndex: -1,
                        };
                    }, () => {
                        this.props.onOrderListChanged(nextOrderList);
                    });
                }}
            >
                { renderItem(itemKey) }
            </DraggableItem>
        );
    }


    render() {
        const { orderList, containerStyle } = this.props;

        return (
            <View style={ containerStyle }>
                {_.map(orderList, (itemKey, itemIndex) => {
                    return this.renderItem(itemKey, itemIndex);
                })}
            </View>
        );
    }
}


export default DragAndDropAnimation;
