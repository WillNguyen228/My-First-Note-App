import {useState, useEffect} from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator} from "react-native";
import {useRouter} from 'expo-router';
import {useAuth} from '@/contexts/AuthContext';
import NoteList from '@/components/NoteList';
import AddNoteModal from '@/components/AddNoteModal';
import noteService from '@/services/noteService';

//This is where all the inner mechanisms happen, components is where all the GUI stuff happens
const NoteScreen = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); 

    const [notes, setNotes] = useState ([]);
    const [modalVisible, setModalVisible] = useState (false);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { 
        if (!authLoading && !user) {
            router.replace('/auth')
        }
    }, [user, authLoading]);

    useEffect(() => { 
        if (user) { //if there is a user then we fetch the notes
            fetchNotes(); 
        }
    }, [user]);

    const fetchNotes = async () => {
        setLoading(true);
        const response = await noteService.getNotes(user.$id);
    
        if (response.error) {
          setError(response.error);
          Alert.alert('Error', response.error);
        } else {
          setNotes(response.data);
          setError(null);
        }
    
        setLoading(false);
      };

    // Add New Note
    const addNote = async () => {
        if(newNote.trim() === '') return;

        const response = await noteService.addNote(user.$id, newNote);

        if (response.error) {
            Alert.alert('Error', response.error);
        } else {
            setNotes([...notes, response.data])
        }

        setNewNote('');
        setModalVisible(false);
    }

    //Delete Note
    const deleteNote = async (id) => {
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const response = await noteService.deleteNote(id);
              if (response.error) {
                Alert.alert('Error', response.error);
              } else {
                setNotes(notes.filter((note) => note.$id !== id));
              }
            },
          },
        ]);
      };

    // Edit Note
    const editNote = async (id, newText) => {
        if (!newText || !newText.trim()) {
            Alert.alert('Error', 'Note text cannot be empty');
            return;
        }

        console.log("Editing Note ID:", id, "New Text:", newText); // Debugging line

        const response = await noteService.updateNote(id, newText);
        if (response.error) {
            Alert.alert('Error', response.error);
          } else {
            setNotes((prevNotes) =>
                prevNotes.map((note) =>
                    note.$id === id ? { ...note, text: response.data.text } : note
            )); //This checks it is the one we want to update
        }
    };

    return ( 
        <View style = {styles.container}>
            { loading ? (
              <ActivityIndicator size = 'large' color = '#007bff' />
            ) : (
                <>
                    { error && <Text style = {styles.errorText}> {error} </Text>}

                    {notes.length === 0 ? (
                        <Text style = {styles.noNotesText}>You have no notes. Be more productive '^'</Text>
                    ) : (<NoteList notes = {notes} onDelete = {deleteNote}
                    onEdit = {editNote}/>)}
                </>
            ) }

            <TouchableOpacity style = {styles.addButton} onPress = { () =>
                setModalVisible(true)}>
                <Text style = {styles.addButtonText}>+ Add Note</Text>
            </TouchableOpacity>

            {/*Modal*/}
            <Modal
                visible = {modalVisible}
                animationType = 'slide'
                transparent
                onRequestClose= {() => setModalVisible(false)}
            >
                <View style = {styles.modalOverlay}>
                    <View style = {styles.modalContent}>
                        <Text style = {styles.modalTitle}>Add a New Note</Text>
                        <TextInput
                            style = {styles.input}
                            placeholder = 'Enter note ...'
                            placeholderTextColor= '#aaa'
                            value = {newNote}
                            onChangeText={setNewNote}
                        />
                        <View style = {styles.modalButtons} >
                            <TouchableOpacity style = {styles.cancelButton} onPress = { () => setModalVisible(false) }>
                                <Text style = {styles.cancelButtonText}> Cancle </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style = {styles.saveButton} onPress={addNote}>
                                <Text style = {styles.saveButtonText}> Save </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
      },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
      },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    noNotesText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        marginTop: 15,
    },
});

export default NoteScreen;