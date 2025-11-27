import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    Pressable,
    Platform,
    Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
export default function App() {
    const [text, setText] = useState("");
    const [todos, setTodos] = useState([]);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowpicker] = useState(false);
    const [photo, setPhoto] = useState(null);
    const getPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
            alert("카메라 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled) return;
        const uri = result.assets[0].uri;
        setPhoto(uri);
    };

    const formatDate = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const addTodo = () => {
        if (!text.trim()) return;

        const newTodo = {
            id: Date.now().toString(),
            title: text.trim(),
            date: formatDate(date),
        };
        setTodos([newTodo, ...todos]);
        setText("");
    };

    const removeTodo = (id) => {
        setTodos(todos.filter((item) => item.id !== id));
    };

    const changeDate = (e, chDate) => {
        if (Platform.OS === "android") {
            setShowpicker(false);
        }
        if (chDate) {
            setDate(chDate);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Todo List</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="할일 입력"
                        value={text}
                        onChangeText={setText}
                        style={styles.input}
                    />
                    <Pressable onPress={() => setShowpicker(true)}>
                        <Text>{formatDate(date)}</Text>
                    </Pressable>

                    <Pressable onPress={addTodo} style={styles.addBtn}>
                        <Text style={styles.addText}>추가</Text>
                    </Pressable>
                </View>
                {showPicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={changeDate}
                    />
                )}

                <FlatList
                    style={styles.list}
                    data={todos}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>할일이 없어요</Text>
                        </View>
                    }
                    renderItem={({ item, index }) => (
                        <Pressable
                            style={styles.todoItem}
                            onLongPress={() => removeTodo(item.id)}
                        >
                            <Text style={styles.todoNumber}>{index + 1}.</Text>
                            <Text style={styles.todoText}>{item.title}</Text>
                            <Text>{item.date}</Text>
                            <Text style={styles.todoHint}>
                                길게 눌러서 삭제
                            </Text>
                        </Pressable>
                    )}
                />
                <Pressable onPress={getPhoto} style={styles.cameraBtn}>
                    <Text style={styles.cameraText}>카메라 촬영</Text>
                </Pressable>
                {photo && (
                    <Image source={{ uri: photo }} style={styles.photo} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        alignItems: "center",
        paddingTop: 50,
    },
    innerContainer: {
        width: "90%",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addBtn: {
        marginLeft: 10,
        backgroundColor: "#007BFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    addText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    dateBtn: {
        marginLeft: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#28a745",
    },
    dateText: {
        color: "#fff",
        fontSize: 14,
    },
    list: {
        width: "100%",
    },
    todoItem: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    todoNumber: {
        fontWeight: "bold",
        marginBottom: 4,
        color: "#555",
    },
    todoText: {
        fontSize: 16,
        color: "#333",
    },
    todoDate: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    todoHint: {
        fontSize: 12,
        color: "#aaa",
        marginTop: 4,
        fontStyle: "italic",
    },
    emptyBox: {
        paddingVertical: 40,
        alignItems: "center",
    },
    emptyText: {
        color: "#aaa",
        fontSize: 16,
    },
    cameraBtn: {
        marginTop: 20,
        backgroundColor: "#ff5722",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cameraText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    photo: {
        width: "100%",
        height: 200,
        marginTop: 15,
        borderRadius: 8,
    },
});
