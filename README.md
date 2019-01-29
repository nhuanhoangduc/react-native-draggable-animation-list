### React native draggable animation list

```javascript
import  React, { Component } from  'react';
import { StyleSheet, Text, View, TouchableOpacity } from  'react-native';
import DragAndDropAnimation from 'react-native-draggable-animation-list';
  
  
export  default  class  App  extends  Component {

	state  = {
		orderList: [0, 1, 2, 3, 4, 5],
		data: ['List 1', 'List 2', 'List 3', 'List 4', 'List 5', 'List 6'],
	}

	render() {
		const { orderList, data } =  this.state;

		return (
			<View  style={styles.container}>
				<DragAndDropAnimation
					orderList={  orderList  }
					onOrderListChanged={(newOrderList) => {
						this.setState({
							orderList: [...newOrderList],
						});
					}}
					activeItemBackgroundColor="red"
					data={  data  }
					renderItem={(itemKey) => {
						return (
							<Text>
								{  data[itemKey] }
							</Text>
						);
					}}
				/>
			</View>
		);
	}

}
```