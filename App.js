import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfo] = React.useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: "34155408716-5n52jpemqroqo4u0dkvmoupmmc9kem87.apps.googleusercontent.com",
    iosClientId: "34155408716-b8vb7q6l9teo0t1opq7l6v67fakoe7q9.apps.googleusercontent.com",
  });

  React.useEffect(() => {
    handleSignInWithGoogle()
  }, [response])

  async function handleSignInWithGoogle() {
    const user = await getLocalUser();
    if (!user) {
      if (response?.type === "success") {
        getUserInfo(response.authentication.accessToken);
      } else{
        setUserInfo(user);
      }
    }
  }

  //web
  //34155408716-5n52jpemqroqo4u0dkvmoupmmc9kem87.apps.googleusercontent.com
  //ios
  //34155408716-b8vb7q6l9teo0t1opq7l6v67fakoe7q9.apps.googleusercontent.com
  //android
  // pas pour l'instant

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data)
  }

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}`}
        }
      );
      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch(e) {console.log(e)}
  }

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <Button
        title="Sign in with Google"
        disabled={!request}
        onPress={() => {
          promptAsync();
        }}
        />
      ) : (
        <View style={styles.card}>
          {userInfo?.picture && (
            <Image source={{ uri: userInfo?.picture }} style={styles.image} />
          )}
          <Text style={styles.text}>Email: {userInfo.email}</Text>
          <Text style={styles.text}>
            Verified: {userInfo.verified_email ? "yes" : "no"}
          </Text>
          <Text style={styles.text}>Name: {userInfo.name}</Text>
        </View>
      )}
      <Button
      title="remove local store"
      onPress={async () => await AsyncStorage.removeItem("@user")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card:{
    width: '90%',
    height: 200,
    backgroundColor: 'blue'
  },
  text:{
    color: 'white',
    fontSize: 20,
    fontWeight: '800'
  },
  image:{
    width: 100,
    height: 100
  }
});
