import { markers } from "@/constants/markers";
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";


// Dustbin images
import purpleMarker from '../../assets/images/locationMarker/black-dustbin.png';
import blueMarker from '../../assets/images/locationMarker/blue-dustbin.png';
import greenMarker from '../../assets/images/locationMarker/green-dustbin.png';
import redMarker from '../../assets/images/locationMarker/red-dustbin.png';
import yellowMarker from '../../assets/images/locationMarker/yellow-dustbin.png';

// Truck images (same wasteType colors)
import { default as blueTruck, default as greenTruck, default as purpleTruck, default as redTruck, default as yellowTruck } from '../../assets/images/trucks/plasticVehicle.png';

const { width, height } = Dimensions.get('window');

// Static trucks placed around Budanilkantha area
const TRUCKS = [
  {
    id: 'truck-1',
    latitude: 27.7801,
    longitude: 85.3630,
    wasteType: 'plastic',
  },
  {
    id: 'truck-2',
    latitude: 27.7777,
    longitude: 85.3598,
    wasteType: 'electronic',
  },
  {
    id: 'truck-3',
    latitude: 27.7744,
    longitude: 85.3625,
    wasteType: 'organic',
  },
  {
    id: 'truck-4',
    latitude: 27.7762,
    longitude: 85.3661,
    wasteType: 'glass',
  },
  {
    id: 'truck-5',
    latitude: 27.7788,
    longitude: 85.3602,
    wasteType: 'metal',
  },
];

export default function MapScreen() {
  const { type } = useLocalSearchParams();
  const [filteredMarkers, setFilteredMarkers] = useState(markers);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
   const [showFilter, setShowFilter] = useState(!!type);
    const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (type && typeof type === "string") {
      const filtered = markers.filter((marker) => marker.wasteType === type);
      setFilteredMarkers(filtered);
      setShowFilter(true);
      fadeAnim.setValue(1);
    } else {
      setFilteredMarkers(markers);
    }
  }, [type]);

  const INITIAL_REGION = {
    latitude: 27.76,
    longitude: 85.35,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const iconMap: Record<string, ImageSourcePropType> = {
    plastic: redMarker,
    electronic: blueMarker,
    organic: yellowMarker,
    glass: greenMarker,
    metal: purpleMarker,
  };

  const truckIconMap: Record<string, ImageSourcePropType> = {
    plastic: redTruck,
    electronic: blueTruck,
    organic: yellowTruck,
    glass: greenTruck,
    metal: purpleTruck,
  };

   const handleResetFilter = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFilter(false);
      setFilteredMarkers(markers);
    });
  };

  const handleMarkerPress = (marker: any) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  const handleDirectionsPress = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
    setModalVisible(false);
  };

  const handleCallPress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
     {/* Filter Indicator */}
          {showFilter && (
            <Animated.View style={[styles.filterContainer, { opacity: fadeAnim }]}>
              <Text style={styles.filterText}>
                Showing {type} disposal sites
              </Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={handleResetFilter}
              >
                <MaterialIcons name="close" size={18} color="#4CAF50" />
              </TouchableOpacity>
            </Animated.View>
          )}
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {/* Dustbin markers */}
        {filteredMarkers.map((marker, index) => (
          <Marker
            key={`dustbin-${index}`}
            coordinate={marker}
            onPress={() => handleMarkerPress(marker)}
          >
            <Image 
              source={iconMap[marker.wasteType]} 
              style={styles.markerImage}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {/* Truck markers */}
        {TRUCKS.map((truck) => (
          <Marker
            key={truck.id}
            coordinate={{
              latitude: truck.latitude,
              longitude: truck.longitude,
            }}
            title={`Truck ${truck.id}`}
          >
            <Image
              source={truckIconMap[truck.wasteType]}
              style={styles.markerImage}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      {/* Custom Callout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Pressable style={styles.modalContent}>
              {selectedMarker && (
                <>
                  <Text style={styles.calloutTitle}>{selectedMarker.name}</Text>
                  <Text style={styles.calloutText}>{selectedMarker.description}</Text>
                  
                  <View style={styles.calloutRow}>
                    <MaterialIcons name="access-time" size={16} color="#607D8B" />
                    <Text style={styles.calloutText}>{selectedMarker.hours}</Text>
                  </View>
                  
                  <View style={styles.calloutRow}>
                    <MaterialIcons name="phone" size={16} color="#607D8B" />
                    <Text style={styles.calloutText}>{selectedMarker.contact}</Text>
                  </View>
                  
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.directionsButton]}
                      onPress={() => handleDirectionsPress(selectedMarker.latitude, selectedMarker.longitude)}
                    >
                      <MaterialIcons name="directions" size={18} color="white" />
                      <Text style={styles.buttonText}>Directions</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.callButton]}
                      onPress={() => handleCallPress(selectedMarker.contact)}
                    >
                      <MaterialIcons name="call" size={18} color="white" />
                      <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight:"bold",
    color: '#263238',
  },
  resetButton: {
    padding: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: '100%',
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 8,
  },
  calloutText: {
    fontSize: 14,
    color: '#455A64',
    marginBottom: 12,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    flex: 1,
  },
  directionsButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  callButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
