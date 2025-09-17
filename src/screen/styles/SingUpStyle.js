import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageBG: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  contentTop: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    top: -15,
  },
  imgLight1: {
    height: 225,
    width: 90,
  },
  imgLight2: {
    height: 160,
    width: 65,
  },
  main: {
    flex: 1,
    paddingTop: 250,
    paddingBottom: 10,
  },
  login: {
    alignItems: "center",
    marginBottom: 50,
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: 50,
  },

  form: {
    flex: 1,
    justifyContent: "flex-start", 
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 5,
  },
  formInputArea: {
    width: "100%",
    backgroundColor: "#0000001A",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  formButtonArea: {
    width: "100%",
  },
  formButton: {
    width: "100%",
    backgroundColor: "#7FBEEB",
    padding: 20,
    borderRadius: 30,
    marginTop: 12,
  },
  formButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 20,
  },

  formFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },
  formFooterSingup: {
    color: "#7FBEEB",
    paddingLeft: 10,
  },
});
