// // import { markers } from '@/constants/markers';
// // import * as Location from 'expo-location';
// // import React, { useEffect } from 'react';
// // import { Alert, StyleSheet, Text, View } from 'react-native';
// // import MapView, { Callout, Marker } from 'react-native-maps';



// // export default function App() {

// //     useEffect(() => {
// //   (async () => {
// //     let { status } = await Location.requestForegroundPermissionsAsync();
// //     if (status !== 'granted') {
// //       console.log('Permission to access location was denied');
// //       return;
// //     }

// //     let location = await Location.getCurrentPositionAsync({});
// //     console.log(location);
// //   })();
// // }, []);


// //     const INITIAL_REGION = {
// //         latitude:27.76,
// //         longitude: 85.35,
// //         latitudeDelta: 2,
// //         longitudeDelta: 2,

// //     }

// //     	const onMarkerSelected = (marker: any) => {
// // 		Alert.alert(marker.name);
// // 	};

// //   return (
// //     <View style={styles.container}>
// //       <MapView
// //   style={styles.map}
// //   initialRegion={INITIAL_REGION}
// //   showsUserLocation
// //   showsMyLocationButton
// // >
// // {markers.map((marker, index) => (
// // 					<Marker
// // 						key={index}
// // 						title={marker.name}
// // 						coordinate={marker}
// // 						onPress={() => onMarkerSelected(marker)}
// // 					>
// // 						<Callout >
// // 							<View style={{ padding: 10 }}>
// // 								<Text style={{ fontSize: 24 }}>Hello</Text>
// // 							</View>
// // 						</Callout>
// // 					</Marker>
// // 				))}

// // </MapView>

// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// //   map: {
// //     width: '100%',
// //     height: '100%',
// //   },
// // });

// // import { wasteCenters } from '@/constants/wasteCenters';
// import { markers } from '@/constants/markers';

// import * as Location from 'expo-location';
// import { useFocusEffect, useLocalSearchParams } from 'expo-router';
// import React, { useCallback, useEffect, useState } from 'react';
// import { Alert, StyleSheet, Text, View } from 'react-native';
// import MapView, { Callout, Marker } from 'react-native-maps';

// export default function App() {
//   const [location, setLocation] = useState(null);
//     const params = useLocalSearchParams();
//   const type = typeof params.type === "string" ? params.type : null;

//     const [filterType, setFilterType] = useState<string | null>(null);

//   useFocusEffect(
//     useCallback(() => {
//       if (typeof params.type === "string") {
//         setFilterType(params.type); // Redirected with a filter
//       } else {
//         setFilterType(null); // Reset if not redirected with a type
//       }
//     }, [params])
//   );

//   const visibleMarkers = type
//     ? markers.filter((m) => m.wasteType === type)
//     : markers;

//     useEffect(() => {
//   (async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       console.log('Permission to access location was denied');
//       return;
//     }

//     let location = await Location.getCurrentPositionAsync({});
//     console.log(location);
//   })();
// }, []);

//   const INITIAL_REGION = {
//     latitude: 27.76,
//     longitude: 85.35,
//     latitudeDelta: 0.1,
//     longitudeDelta: 0.1,
//   };


//     const getPinColor = (wasteType: string) => {
//     switch (wasteType) {
//       case 'plastic':
//         return 'blue';
//       case 'electronic':
//         return 'red';
//       case 'organic':
//         return 'green';
//       case 'glass':
//         return 'yellow';
//       case 'metal':
//         return 'purple';
//       default:
//         return 'gray';
//     }
//   };

//   const onMarkerSelected = (marker: any) => {
//     Alert.alert(
//       marker.name,
//       `Type: ${marker.wasteType}\nHours: ${marker.hours}\nContact: ${marker.contact}`
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={INITIAL_REGION}
//         showsUserLocation
//         showsMyLocationButton
        
//       >
//         {visibleMarkers.map((marker:any, index:any) => (
//           <Marker
//           pinColor={getPinColor(marker.wasteType)}
//             key={index}
//             coordinate={marker}
//             title={marker.name}
//             onPress={() => onMarkerSelected(marker)}
//           >
//             <Callout>
//               <View style={styles.callout}>
//                 <Text style={styles.name}>{marker.name}</Text>
//                 <Text>♻️ Type: {marker.wasteType}</Text>
//                 <Text>🕐 Hours: {marker.hours}</Text>
//                 <Text>📞 Contact: {marker.contact}</Text>
//               </View>
//             </Callout>
//           </Marker>
//         ))}
//       </MapView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   callout: {
//     padding: 10,
//     maxWidth: 200,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
// });

import { markers } from "@/constants/markers";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ImageSourcePropType,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

import blueMarker from '../../assets/images/locationMarker/BlueMarker.png';
import greenMarker from '../../assets/images/locationMarker/GreenMarker.png';
import purpleMarker from '../../assets/images/locationMarker/PurpleMarker.png';
import redMarker from '../../assets/images/locationMarker/RedMarker.png';
import yellowMarker from '../../assets/images/locationMarker/YellowMarker.png';

export default function MapScreen() {
  const { type } = useLocalSearchParams(); // comes from router.push('/map?type=plastic')
  const [filteredMarkers, setFilteredMarkers] = useState(markers);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (type && typeof type === "string") {
      const filtered = markers.filter((marker) => marker.wasteType === type);
      setFilteredMarkers(filtered);
    } else {
      setFilteredMarkers(markers);
    }
  }, [type]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate loading
    setTimeout(() => {
      setFilteredMarkers(markers); // Reset to all
      setRefreshing(false);
    }, 1000);
  }, []);

  const INITIAL_REGION = {
    latitude: 27.76,
    longitude: 85.35,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const getColor = (wasteType: string) => {
    switch (wasteType) {
      case "plastic":
        return "blue";
      case "organic":
        return "green";
      case "electronic":
        return "purple";
      case "glass":
        return "orange";
      case "metal":
        return "gray";
      default:
        return "red";
    }
  };

const iconMap: Record<string, ImageSourcePropType> = {
  plastic: redMarker,
  electronic: blueMarker,
  organic: yellowMarker,
  glass: greenMarker,
  metal: purpleMarker,
};


  return (

    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
      <View style={styles.container}>
        {type && (
            <Text style={styles.filterNote}>
            Showing {type} waste sites — Pull down to reset
          </Text>
        )}
        <MapView style={styles.map} initialRegion={INITIAL_REGION}>
          {filteredMarkers.map((marker, index) => (
              <Marker
              key={index}
              coordinate={marker}
              // pinColor={getColor(marker.wasteType)}
              image={iconMap[marker.wasteType]}
              >
              <Callout>
                <View>
                  <Text style={{ fontWeight: "bold" }}>{marker.name}</Text>
                  <Text>{marker.description}</Text>
                  <Text>Contact: {marker.contact}</Text>
                  <Text>Hours: {marker.hours}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    filterNote: {
        padding: 8,
        textAlign: "center",
    backgroundColor: "#eef",
    fontWeight: "600",
    zIndex: 10,
  },
});
