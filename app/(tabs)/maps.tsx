import { markers } from "@/constants/markers";
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
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

// Import marker images
import purpleMarker from '../../assets/images/locationMarker/black-dustbin.png';
import blueMarker from '../../assets/images/locationMarker/blue-dustbin.png';
import greenMarker from '../../assets/images/locationMarker/green-dustbin.png';
import redMarker from '../../assets/images/locationMarker/red-dustbin.png';
import yellowMarker from '../../assets/images/locationMarker/yellow-dustbin.png';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const { type } = useLocalSearchParams();
  const [filteredMarkers, setFilteredMarkers] = useState(markers);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (type && typeof type === "string") {
      const filtered = markers.filter((marker) => marker.wasteType === type);
      setFilteredMarkers(filtered);
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
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {filteredMarkers.map((marker, index) => (
          <Marker
            key={index}
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