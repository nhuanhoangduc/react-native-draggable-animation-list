import React, { PureComponent } from 'react';
import { StyleSheet, PanResponder, Animated } from 'react-native';
import _ from 'lodash';


const styles = StyleSheet.create({
    itemWrapper: {
        elevation: 0,
        zIndex: -1,
    },
    itemWrapper__active: {
        zIndex: 2,
        elevation: 2,
    },
});


class DraggableItem extends PureComponent {
    
    blockGesture = false
    componentPositionY = 0
    componentHeight = 0
    animatedPositionYValue = new Animated.Value(0)

    state = {
        isPressed: false,
    }


    constructor(props) {
        super(props);

        this.caculateLayout = this.caculateLayout.bind(this);
        this.caculateCurrentActiveIndex = this.caculateCurrentActiveIndex.bind(this);

        this._panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    
            onPanResponderGrant: async (event) => {
                this.props.onItemPressed(this.componentHeight);
            },
            onPanResponderMove: async (event, gestureState) => {
                const { moveY, y0 } = gestureState;

                const offsetY = moveY - y0;
                const currentActiveIndex = this.caculateCurrentActiveIndex(offsetY);

                this.animatedPositionYValue.setValue(offsetY);
                this.props.onActiveItemNextIndexChanged(currentActiveIndex);
            },
            onPanResponderTerminationRequest: (event, gestureState) => true,
            onPanResponderRelease: (event, gestureState) => {
                const { index, activeItemNextIndex } = this.props;
                const nextPositionY = (activeItemNextIndex - index) * this.componentHeight;

                console.log(activeItemNextIndex, index);


                if (this.animatedPositionYValue._value === 0) {
                    this.props.onActiveItemReleased();
                } else {
                    Animated.timing(
                        this.animatedPositionYValue,
                        {
                            toValue: nextPositionY,
                            duration: 250,
                            useNativeDriver: true,
                        },
                    ).start(() => {
                        this.props.onActiveItemReleased();
                    });
                }
            },
            onShouldBlockNativeResponder: (evt, gestureState) => {
              return true;
            },
        });
    }
    
    componentWillReceiveProps(nextProps) {
        const isActive = (this.props.index === this.props.activeItemIndex);
        const isNextActive = (nextProps.index === nextProps.activeItemIndex);

        if (this.props.activeItemIndex >= 0 && nextProps.activeItemIndex < 0) {
            this.resetAnimation(0);
            return;
        }

        if (
            !isNextActive &&
            this.props.activeItemNextIndex !== nextProps.activeItemNextIndex &&
            this.props.index < nextProps.activeItemIndex &&
            this.props.index >= nextProps.activeItemNextIndex
        ) {
            this.moveDownAnimation();
            return;
        }

        if (
            !isNextActive &&
            this.props.activeItemNextIndex !== nextProps.activeItemNextIndex &&
            this.props.index < nextProps.activeItemIndex &&
            this.props.index < nextProps.activeItemNextIndex
        ) {
            this.resetAnimation();
            return;
        }

        if (
            !isNextActive &&
            this.props.activeItemNextIndex !== nextProps.activeItemNextIndex &&
            this.props.index > nextProps.activeItemIndex &&
            this.props.index <= nextProps.activeItemNextIndex
        ) {
            this.moveUpAnimation();
            return;
        }

        if (
            !isNextActive &&
            this.props.activeItemNextIndex !== nextProps.activeItemNextIndex &&
            this.props.index > nextProps.activeItemIndex &&
            this.props.index > nextProps.activeItemNextIndex
        ) {
            this.resetAnimation();
            return;
        }

    }

    componentDidUpdate(prevProps) {
        const isPreviousActive = (prevProps.index === prevProps.activeItemIndex);
        const isActive = (this.props.index === this.props.activeItemIndex);

        if (isPreviousActive && !isActive) {
            this.resetAnimation(0);
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.caculateLayout();
        }, 10);
    }

    caculateCurrentActiveIndex(offsetY) {
        const { index, orderLength } = this.props;
        let nextIndex = -1;
        
        if (offsetY < 0) {
            if (Math.abs(offsetY) < (this.componentHeight / 2)) {
                nextIndex = index
            }
            else if (Math.abs(offsetY) < (1.5 * this.componentHeight)) {
                nextIndex = index - 1;
            } else {
                nextIndex = index - Math.floor((Math.abs(offsetY) + (this.componentHeight / 2)) / this.componentHeight);
            }
        } else {
            if (offsetY < (this.componentHeight / 2)) {
                nextIndex = index;
            }
            else if (offsetY < (1.5 * this.componentHeight)) {
                nextIndex = index + 1;
            } else {
                nextIndex = index + Math.floor((offsetY + (this.componentHeight / 2)) / this.componentHeight);
            }
        }

        if (nextIndex >= orderLength.length) {
            nextIndex = orderLength.length - 1;
        } else if (nextIndex < 0) {
            nextIndex = 0;
        }

        return nextIndex;
    }

    caculateLayout() {
        if (!this.componentRef) {
            return;
        }

        this.componentRef._component.measure((a, b, width, height, px, py) => {
            this.componentPositionY = py;
            this.componentHeight = height;
        });
    }

    resetAnimation(duration = 350) {
        Animated.timing(
            this.animatedPositionYValue,
            {
                toValue: 0,
                duration: duration,
                useNativeDriver: true,
            },
        ).start();
    }

    moveDownAnimation() {
        const { activeItemHeight } = this.props;

        Animated.timing(
            this.animatedPositionYValue,
            {
                toValue: activeItemHeight,
                duration: 350,
                useNativeDriver: true,
            },
        ).start();
    }

    moveUpAnimation() {
        const { activeItemHeight } = this.props;

        Animated.timing(
            this.animatedPositionYValue,
            {
                toValue: -activeItemHeight,
                duration: 350,
                useNativeDriver: true,
            },
        ).start();
    }

    render() {
        const { index, activeItemIndex, activeItemBackgroundColor, children } = this.props;
        const isActivedItem = (index === activeItemIndex);

        const positionY = this.animatedPositionYValue.interpolate({
            inputRange: [-10000, 0, 10000],
            outputRange: [-10000, 0, 10000],
        });


        return (
            <Animated.View
                ref={(ref) => this.componentRef = ref}
                { ...this._panResponder.panHandlers }
                renderToHardwareTextureAndroid={ true }
                style={[
                    styles.itemWrapper,
                    index % 2 === 0 ? styles.itemWrapper__gray : null,
                    isActivedItem ? [styles.itemWrapper__active, { backgroundColor: activeItemBackgroundColor, }] : null,
                    {
                        transform: [
                            {
                                translateY: positionY,
                            }
                        ],
                    }
                ]}
            >   
                { children }
            </Animated.View>
        );
    }
}


export default DraggableItem;
