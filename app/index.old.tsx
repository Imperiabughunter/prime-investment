
import { Text, View, Image } from 'react-native';
import Button from '../components/Button';
import { commonStyles, buttonStyles } from '../styles/commonStyles';

export default function OldMainScreen() {
  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.content}>
        <Image
          source={require('../assets/images/final_quest_240x240.png')}
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
        <Text style={commonStyles.title}>This is a placeholder app.</Text>
        <Text style={commonStyles.text}>Your app will be displayed here when it's ready.</Text>
        <View style={commonStyles.buttonContainer}>
          <Button
            text="Get Started"
            onPress={() => {}}
            style={buttonStyles.instructionsButton}
          />
        </View>
      </View>
    </View>
  );
}
