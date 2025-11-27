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
    Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function App() {
    const [text, setText] = useState("");
    const [todos, setTodos] = useState([]);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowpicker] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [editingId, setEditingId] = useState(null); // 편집중인 Todo ID

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

    const addOrEditTodo = () => {
        if (!text.trim() && !photo) return;

        if (editingId) {
            // 수정
            setTodos(
                todos.map((t) =>
                    t.id === editingId
                        ? {
                              ...t,
                              title: text.trim(),
                              photo: photo,
                              date: formatDate(date),
                          }
                        : t
                )
            );
            setEditingId(null);
        } else {
            // 새로 추가
            const newTodo = {
                id: Date.now().toString(),
                title: text.trim(),
                date: formatDate(date),
                photo: photo,
                anima: new Animated.Value(0),
            };

            setTodos([newTodo, ...todos]);

            Animated.timing(newTodo.anima, {
                toValue: 1,
                duration: 700,
                useNativeDriver: false,
            }).start();
        }

        setText("");
        setPhoto(null);
    };

    const removeTodo = (id) => {
        setTodos(todos.filter((item) => item.id !== id));
    };

    const editTodo = (item) => {
        setText(item.title);
        setPhoto(item.photo);
        setDate(new Date(item.date));
        setEditingId(item.id);
    };

    const changeDate = (e, chDate) => {
        if (Platform.OS === "android") setShowpicker(false);
        if (chDate) setDate(chDate);
        setShowpicker(false);
    };

    const TodoItem = ({ item, index }) => {
        const rot = item.anima.interpolate({
            inputRange: [0, 0.33, 0.67, 1],
            outputRange: ["0deg", "-10deg", "10deg", "0deg"],
        });

        const sca = item.anima.interpolate({
            inputRange: [0, 0.33, 0.67, 1],
            outputRange: [1, 1.2, 1.2, 1],
        });

        return (
            <Animated.View
                style={{ transform: [{ scale: sca }, { rotate: rot }] }}
            >
                <Pressable
                    style={styles.todoItem}
                    onLongPress={() => removeTodo(item.id)} // 길게 눌러 삭제 유지
                >
                    <Text style={styles.todoNumber}>{index + 1}.</Text>
                    {item.title ? (
                        <Text style={styles.todoText}>{item.title}</Text>
                    ) : null}
                    {item.photo && (
                        <Image
                            source={{ uri: item.photo }}
                            style={styles.todoPhoto}
                        />
                    )}
                    <Text style={styles.todoDate}>{item.date}</Text>

                    {/* 수정 버튼만 유지, 삭제는 길게 눌러서 */}
                    <View style={styles.todoActions}>
                        <Pressable
                            onPress={() => editTodo(item)}
                            style={styles.editBtn}
                        >
                            <Text style={styles.editText}>수정</Text>
                        </Pressable>
                        <Text
                            style={{
                                marginLeft: 5,
                                marginTop: 2,
                                color: "#aaa",
                            }}
                        >
                            길게 눌러 삭제
                        </Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
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
                    <Pressable onPress={getPhoto} style={styles.cameraBtn}>
                        <Text style={styles.cameraText}>카메라</Text>
                    </Pressable>
                    <Pressable
                        style={styles.dateBox}
                        onPress={() => setShowpicker(true)}
                    >
                        <Text style={styles.dateText}>{formatDate(date)}</Text>
                    </Pressable>
                    <Pressable onPress={addOrEditTodo} style={styles.addBtn}>
                        <Text style={styles.addText}>
                            {editingId ? "수정완료" : "추가"}
                        </Text>
                    </Pressable>
                </View>

                {photo && (
                    <View style={styles.previewContainer}>
                        <Text style={styles.previewLabel}>미리보기</Text>
                        <Image
                            source={{ uri: photo }}
                            style={styles.previewPhoto}
                        />
                    </View>
                )}

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
                        <TodoItem item={item} index={index} />
                    )}
                />
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
    innerContainer: { width: "90%" },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    cameraBtn: {
        marginLeft: 8,
        backgroundColor: "orange",
        padding: 8,
        borderRadius: 8,
    },
    cameraText: { color: "#fff", fontSize: 16 },
    dateBox: {
        marginLeft: 8,
        backgroundColor: "skyblue",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
    },
    dateText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
    addBtn: {
        marginLeft: 8,
        backgroundColor: "red",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    addText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    previewContainer: { marginVertical: 10, alignItems: "center" },
    previewLabel: { fontSize: 14, marginBottom: 4, color: "#333" },
    previewPhoto: { width: 120, height: 120, borderRadius: 8 },
    list: { width: "100%" },
    todoItem: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    todoNumber: { fontWeight: "bold", marginBottom: 4, color: "#555" },
    todoText: { fontSize: 16, color: "#333" },
    todoDate: { fontSize: 12, color: "#888", marginTop: 2, fontWeight: "bold" },
    todoPhoto: { width: "100%", height: 150, marginTop: 6, borderRadius: 8 },
    todoHint: {
        fontSize: 12,
        color: "#aaa",
        marginTop: 4,
        fontStyle: "italic",
    },
    todoActions: { flexDirection: "row", marginTop: 6 },
    editBtn: {
        backgroundColor: "blue",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
    },
    editText: { color: "#fff" },
    emptyBox: { paddingVertical: 40, alignItems: "center" },
    emptyText: { color: "#aaa", fontSize: 16 },
});
