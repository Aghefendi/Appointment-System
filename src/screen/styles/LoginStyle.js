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
    marginBottom: 20,
  },

  loginText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: 48,
    textShadowColor: "#00000066",
    textShadowOffset: { width: 10, height: 10 },
    textShadowRadius: 5,
  },

  form: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 5,
  },

  formInputArea: {
    width: "100%",
    backgroundColor: "#0330910a",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 16,
    //elevation: 3,
    borderColor: "#7FBEEB",
    borderWidth: 1,
  },

  input: {
    fontSize: 16,
    color: "black",
  },

  formButtonArea: {
    width: "100%",
  },

  formButton: {
    width: "100%",
    backgroundColor: "#7FBEEB",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 10,
    elevation: 3,
  },

  formButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },

  formFooter: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  formFooterSingup: {
    color: "#7FBEEB",
    paddingLeft: 8,
    fontWeight: "bold",
  },
});
