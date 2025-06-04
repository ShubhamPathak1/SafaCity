
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
import titleSize from "./_layout";
// console.log(titleSize)

import blueMarker from '../../assets/images/locationMarker/blue-dustbin.png';
import greenMarker from '../../assets/images/locationMarker/green-dustbin.png';
import purpleMarker from '../../assets/images/locationMarker/black-dustbin.png';
import redMarker from '../../assets/images/locationMarker/red-dustbin.png';
import yellowMarker from '../../assets/images/locationMarker/yellow-dustbin.png';

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
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
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
        <MapView style={styles.map} initialRegion={INITIAL_REGION} showsUserLocation showsMyLocationButton>
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
