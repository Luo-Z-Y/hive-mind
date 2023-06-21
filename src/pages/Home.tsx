import { css } from "@emotion/css";
import { Box, Button, Modal, Paper, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { db } from "../config/Firebase";
import { DocumentData, DocumentSnapshot, Query, QuerySnapshot, addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { NavigateFunction, useNavigate } from "react-router-dom";
import DocumentRow from "../components/DocumentRow";
import { nanoid } from "nanoid";

export default function Home(): JSX.Element {
  const [isAddingDoc, setIsAddingDoc] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>("New Project");
  const [docsData, setDocsData] = useState<DocumentData[]>([]);
  const navigate: NavigateFunction = useNavigate();

  useEffect(() => {
    getDoc(doc(db, "sessions", "active-session")).then(docSnap => docSnap!.data())
      .then(session => onSnapshot(
        query(collection(db, "userProjects", session!.user.uid, "projects"),
          orderBy("timeStamp"), orderBy("fileName")),
        docsSnap => {
          const currDocs: DocumentData[] = [];
          docsSnap.forEach(doc => currDocs.push({...doc.data(), user: session!.user.uid, id: doc.id}))
          setDocsData(currDocs);
        }
      ));
  }, []);

  const onCreateProjectHandler = () => {
    if (newDocName !== "") {
      getDoc(doc(db, "sessions", "active-session")).then(docSnap => docSnap!.data())
        .then(session => {
          const userId: string = session!.user.uid as string;
          const q: Query<DocumentData> = query(collection(db, "userProjects", userId, "projects"),
            where("fileName", "==", newDocName));
          getDocs(q).then(docs => {
            if (docs.docs.length > 0) {
              alert("A project named " + newDocName + " already exists!");
            } else {
              addDoc(collection(db, "userProjects", userId, "projects"), {
                fileName: newDocName,
                timeStamp: serverTimestamp(),
                slateValue: [
                  {
                    id: nanoid(),
                    type: "paragraph",
                    children: [
                      {
                        text: ""
                      }
                    ]
                  }
                ],
              });
            }
          });
          setNewDocName("New Project");
          setIsAddingDoc(false);
        });
    } else {
      alert("Project name cannot be empty!");
    }
  }

  return (
    <div
      className={css`
        padding: 2.5em;
      `}
    >
      <Paper
        elevation={3}
        className={css`
          margin: auto;
          max-width: 75%;
          min-height: 75%;
        `}
      >
      <section>
        <Box
          className={css`
            text-align: right;
            padding: 1em;
            box-shadow: 0 2.5px 5px rgb(128, 128, 128, 0.5);
          `}
        >
          <Button 
          variant="contained"
          onClick={() => setIsAddingDoc(true)}>
            Add new document
          </Button>
        </Box>
        <Modal
          open={isAddingDoc}
          onClose={() => setIsAddingDoc(false)}
        >
          <Box className={css`
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 400px;
            background-color: white;
            box-shadow: 0px 0px 5em rgb(64, 64, 64);
            padding: 2em;
            border-radius: 1em;
            text-align: center;
          `}>
            <TextField
              variant="outlined"
              label="Project Title"
              defaultValue="New Project"
              fullWidth
              margin="normal"
              onChange={event => setNewDocName(event.target.value)}
            />
            <Button
              variant="text"
              onClick={() => setIsAddingDoc(false)}
              sx={{
                margin: "0 0.75em"
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onCreateProjectHandler}
              sx={{
                margin: "0 0.75em"
              }}
            >
              Create Project
            </Button>
          </Box>
        </Modal>
      </section>
      <section>
        {docsData.map(data =>
          <DocumentRow key={data.id} docData={data} />
        )}
      </section>
      </Paper>
    </div>
  );
}