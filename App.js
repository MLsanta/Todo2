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
    const [editingId, setEditingId] = useState(null);

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
        if (!result.canceled) setPhoto(result.assets[0].uri);
    };

    const pickImage = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) setPhoto(result.assets[0].uri);
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
            setTodos(
                todos.map((t) =>
                    t.id === editingId
                        ? {
                              ...t,
                              title: text.trim(),
                              photo,
                              date: formatDate(date),
                          }
                        : t
                )
            );
            setEditingId(null);
        } else {
            const newTodo = {
                id: Date.now().toString(),
                title: text.trim(),
                date: formatDate(date),
                photo,
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

    const removeTodo = (id) => setTodos(todos.filter((item) => item.id !== id));

    const editTodo = (item) => {
        setEditingId(item.id);
        setText(item.title);
        setPhoto(item.photo);
        setDate(new Date(item.date));
    };

    const changeDate = (event, selectedDate) => {
        if (event.type === "dismissed") {
            setShowpicker(false);
            return;
        }

        if (selectedDate) setDate(selectedDate);

        // Android는 날짜 선택하면 자동으로 닫힘
        if (Platform.OS === "android") {
            setShowpicker(false);
        }
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
                    onLongPress={() => removeTodo(item.id)}
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

                    <View style={styles.todoActions}>
                        <Pressable
                            style={styles.editBtn}
                            onPress={() => editTodo(item)}
                        >
                            <Text style={styles.editText}>수정</Text>
                        </Pressable>

                        <Text style={styles.deleteHint}>길게 눌러 삭제</Text>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Todo List</Text>

                {/* 상단 입력 영역 */}
                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="할일 입력"
                        value={text}
                        onChangeText={setText}
                        style={styles.input}
                    />

                    <Pressable onPress={getPhoto} style={styles.button}>
                        <Text style={styles.buttonText}>카메라</Text>
                    </Pressable>

                    <Pressable onPress={pickImage} style={styles.button}>
                        <Text style={styles.buttonText}>갤러리</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setShowpicker(true)}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            {formatDate(date)}
                        </Text>
                    </Pressable>
                </View>

                {/* 미리보기 */}
                {photo && (
                    <View style={styles.previewContainer}>
                        <Text style={styles.previewLabel}>미리보기</Text>
                        <Image
                            source={{ uri: photo }}
                            style={styles.previewPhoto}
                        />
                    </View>
                )}

                {/* 추가 버튼 — 미리보기 바로 위 */}
                <Pressable style={styles.addBtnFull} onPress={addOrEditTodo}>
                    <Text style={styles.addText}>
                        {editingId ? "수정 완료" : "추가하기"}
                    </Text>
                </Pressable>

                {/* 날짜 선택 */}
                {showPicker && (
                    <>
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={
                                Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={changeDate}
                        />

                        {Platform.OS === "ios" && (
                            <Pressable
                                style={styles.iosDoneBtn}
                                onPress={() => setShowpicker(false)}
                            >
                                <Text style={styles.iosDoneText}>
                                    날짜 선택 완료
                                </Text>
                            </Pressable>
                        )}
                    </>
                )}

                <FlatList
                    style={styles.list}
                    data={todos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <TodoItem item={item} index={index} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyText}>할일이 없어요</Text>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const BUTTON_HEIGHT = 40;

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
    },

    // 버튼 크기 통일
    button: {
        height: BUTTON_HEIGHT,
        paddingHorizontal: 10,
        backgroundColor: "blue",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginLeft: 6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "bold",
    },

    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    input: {
        flex: 1,
        height: BUTTON_HEIGHT,
        borderColor: "#ccc",
        borderWidth: 1,
        backgroundColor: "white",
        paddingHorizontal: 10,
        borderRadius: 8,
    },

    previewContainer: { alignItems: "center", marginVertical: 10 },
    previewLabel: { fontSize: 14, marginBottom: 4 },
    previewPhoto: { width: 120, height: 120, borderRadius: 8 },

    addBtnFull: {
        marginTop: 5,
        backgroundColor: "red",
        height: BUTTON_HEIGHT,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    addText: { color: "white", fontSize: 18, fontWeight: "bold" },

    iosDoneBtn: {
        marginTop: 5,
        paddingVertical: 10,
        backgroundColor: "#007bff",
        borderRadius: 8,
        alignItems: "center",
    },
    iosDoneText: { color: "white", fontSize: 16, fontWeight: "bold" },

    list: { width: "100%" },

    todoItem: {
        backgroundColor: "white",
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
    },
    todoNumber: { fontWeight: "bold", color: "#444" },
    todoText: { fontSize: 16, marginTop: 4 },
    todoDate: { fontSize: 12, color: "#777", marginTop: 5 },
    todoPhoto: { width: "100%", height: 150, borderRadius: 8, marginTop: 6 },

    todoActions: { flexDirection: "row", marginTop: 8, alignItems: "center" },
    editBtn: {
        backgroundColor: "blue",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        height: BUTTON_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    editText: { color: "white" },
    deleteHint: { marginLeft: 8, color: "#555" },

    emptyBox: { alignItems: "center", paddingVertical: 40 },
    emptyText: { color: "#aaa" },
});
