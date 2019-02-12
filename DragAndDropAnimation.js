import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';
import _ from 'lodash';

import DraggableItem from './DraggableItem';


class DragAndDropAnimation extends PureComponent {

    draggingTimeout = null

    state = {
        activeItemHeight: -1,
        activeItemIndex: -1,
        activeItemNextIndex: -1,

        containerHeight: 0,
        containerPositionY: -1,

        isScrollEnabled: true,
    }

    componentDidMount() {
        setTimeout(() => {
            this.caculateLayout();
        }, 10);
    }


    caculateLayout() {
        if (!this.containerRef) {
            return;
        }

        this.containerRef.measure((a, b, width, height, px, py) => {
            let containerHeight = height;

            this.setState({
                containerPositionY: py,
            });

            this.containerScrollRef._innerViewRef.measure((a, b, width, height, px, py) => {
                this.setState({
                    containerHeight: Math.min(height, containerHeight),
                });
            });
        });
    }

    move(orderList, oldIndex, newIndex) {
        const movableItem = orderList.splice(oldIndex, 1)[0];

        const preArray = orderList.slice(0, newIndex);
        const postArray = orderList.slice(newIndex, orderList.length);
        const newArray = [...preArray, movableItem, ...postArray];

        return newArray;
    }

    renderItem(itemKey, itemIndex) {
        const { orderList, renderItem,activeItemBackgroundColor, delayLongPress } = this.props;
        const { activeItemHeight, activeItemIndex, activeItemNextIndex, containerHeight, containerPositionY } = this.state;

        return (
            <DraggableItem
                key={ itemKey }
                index={ itemIndex }
                orderLength={ orderList.length || 0 }
                activeItemBackgroundColor={ activeItemBackgroundColor || 'gray' }

                activeItemHeight={ activeItemHeight }
                activeItemIndex={ activeItemIndex }
                activeItemNextIndex={ activeItemNextIndex }

                containerHeight={ containerHeight }
                containerPositionY={ containerPositionY }

                onItemPressed={(itemHeight) => {
                    this.draggingTimeout = setTimeout(() => {
                        this.containerScrollRef.setNativeProps({ scrollEnabled: false, });
                        this.setState({
                            activeItemIndex: itemIndex,
                            activeItemNextIndex: itemIndex,
                            activeItemHeight: itemHeight,
                            isScrollEnabled: false,
                        }, () => {
                            this.props.onDraggableItemStart && this.props.onDraggableItemStart(itemIndex);
                        });
                        this.draggingTimeout = null;
                    }, delayLongPress || 500);
                }}
                onActiveItemNextIndexChanged={(currentIndex) => {
                    this.setState({
                        activeItemNextIndex: currentIndex,
                    });
                }}
                onActiveItemReleased={() => {
                    const { activeItemIndex } = this.state;
                    
                    if (activeItemIndex < 0) {
                        if (this.draggingTimeout) {
                            clearTimeout(this.draggingTimeout);
                            this.draggingTimeout = null;
                        }
                        return;
                    }

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
                        this.props.onOrderListChanged && this.props.onOrderListChanged(nextOrderList);
                        this.props.onDraggableItemRelease && this.props.onDraggableItemRelease(activeItemNextIndex);
                        this.containerScrollRef.setNativeProps({ scrollEnabled: true, });
                    });
                }}
            >
                { renderItem(itemKey, itemIndex) }
            </DraggableItem>
        );
    }


    render() {
        const { orderList, style, contentContainerStyle } = this.props;

        return (
            <View
                ref={(ref) => this.containerRef = ref}
                renderToHardwareTextureAndroid={ true }
            >
                <ScrollView
                    ref={(ref) => this.containerScrollRef = ref}
                    style={ style }
                    contentContainerStyle={ contentContainerStyle }
                >
                    {_.map(orderList, (itemKey, itemIndex) => {
                        return this.renderItem(itemKey, itemIndex);
                    })}
                </ScrollView>
            </View>
        );
    }
}


export default DragAndDropAnimation;
