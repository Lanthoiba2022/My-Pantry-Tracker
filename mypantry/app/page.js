'use client'
import { Box, Button, Modal, Stack, TextField, Typography, Paper } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import { useEffect, useState } from "react";
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';  // Correct import

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  gap: 3,
  display: 'flex',
  flexDirection: 'column',
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemExpiryDate, setItemExpiryDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editItemName, setEditItemName] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setItemName('');
    setItemQuantity(1);
    setItemExpiryDate(null);
    setEditMode(false);
    setOpen(false);
  };

  const updatePantry = async () => {
    try {
      const snapshot = query(collection(firestore, 'Pantry'));
      const docs = await getDocs(snapshot);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push({ name: doc.id, ...doc.data() });
      });
      setPantry(pantryList);
    } catch (error) {
      console.error("Error updating pantry:", error);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item, quantity, expiryDate) => {
    try {
      const docRef = doc(collection(firestore, 'Pantry'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, { count: count + quantity, expiryDate }, { merge: true });
      } else {
        await setDoc(docRef, { count: quantity, expiryDate });
      }
      await updatePantry();
      handleClose();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'Pantry'), item);
      await deleteDoc(docRef);
      await updatePantry();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const editItem = async (item, quantity, expiryDate) => {
    try {
      const docRef = doc(collection(firestore, 'Pantry'), item);
      await setDoc(docRef, { count: quantity, expiryDate }, { merge: true });
      await updatePantry();
      handleClose();
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      gap={2}
      padding={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {editMode ? 'Edit Item' : 'Add Item'}
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={editMode}
            />
            <TextField
              id="outlined-basic"
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiry Date"
                value={itemExpiryDate}
                onChange={(newValue) => setItemExpiryDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
            <Button
              variant="outlined"
              onClick={() => {
                if (editMode) {
                  editItem(editItemName, itemQuantity, itemExpiryDate);
                } else {
                  addItem(itemName, itemQuantity, itemExpiryDate);
                }
              }}
            >
              {editMode ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button variant="contained" onClick={handleOpen}>ADD</Button>
      <Paper elevation={3} sx={{ padding: 2, width: '100%', maxWidth: 800, marginTop: 2 }}>
        <Box
          width="100%"
          bgcolor={"#ADD8E6"}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          paddingY={2}
          borderRadius={1}
        >
          <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width='100%' spacing={2} padding={2}>
          {pantry.map(({ name, count, expiryDate }) => (
            <Box
              key={name}
              width="100%"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={"#f0f0f0"}
              paddingX={3}
              paddingY={2}
              borderRadius={1}
              boxShadow={1}
            >
              <Typography variant={'h6'} color={'#333'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" color={'#333'}>
                Quantity: {count}
              </Typography>
              <Typography variant="h6" color={'#333'}>
                Expiry Date: {expiryDate ? new Date(expiryDate.seconds * 1000).toLocaleDateString() : 'N/A'}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    setEditMode(true);
                    setItemName(name);
                    setItemQuantity(count);
                    setItemExpiryDate(expiryDate ? new Date(expiryDate.seconds * 1000) : null);
                    setEditItemName(name);
                    handleOpen();
                  }}
                >
                  Edit
                </Button>
                <Button variant="contained" color="error" onClick={() => removeItem(name)}>Remove</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
