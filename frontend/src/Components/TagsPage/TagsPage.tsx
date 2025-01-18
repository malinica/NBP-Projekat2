import CreateTagForm from "../CreateTagForm/CreateTagForm"; 
import styles from "./TagsPage.module.css";
import { TagPicker } from "../TagPicker/TagPicker";
import { useState } from "react";
import { Tag } from "../../Interfaces/Tag/Tag";
import { deleteTagAPI, updateTagAPI } from "../../Services/TagService.tsx"; 
import { toast } from "react-hot-toast";

const TagsPage = () => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');

  const handleAddTag = (tag: Tag) => {
    setSelectedTags([tag]);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags([]);
  };

  const handleDeleteTag = async () => {
    if (!selectedTags.length) {
      toast.error("Nema taga za brisanje.");
      return;
    }

    try {
      const tagToDelete = selectedTags[0].id;
      const response = await deleteTagAPI(tagToDelete);
      if (response) {
        toast.success("Tag uspešno obrisan.");
        setSelectedTags([]);
      }
    } catch (error) {
      toast.error("Došlo je do greške prilikom brisanja taga.");
    }
  };

  const handleUpdateTag = async () => {
    if (selectedTags.length) {
      const tagToEdit = selectedTags[0];
      const response = await updateTagAPI(tagToEdit.id, newName, newDescription);
      if (response) {
        toast.success("Tag uspešno ažuriran.");
        setSelectedTags([
          { ...tagToEdit, name: newName, description: newDescription },
        ]
        );
        setModalVisible(false);
        setNewName('');
        setNewDescription('');
      }
    }
  };

  const handleOpenEditModal = () => {
    if (selectedTags.length) {
      const tag = selectedTags[0]; 
      setTagToEdit(tag);
      setNewName(tag.name);
      setNewDescription(tag.description || '');
      setModalVisible(true);
    }
  };

  return (
    <div className={`container-fluid bg-light-lilac d-flex justify-content-start flex-grow-1`}>
      <div className={`row container-fluid d-flex justify-content-center my-4`}>
        <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12`}>
          <CreateTagForm/>
        </div>
        <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12 align-content-center`}>
          <div className={`mx-2`}>
            <h2 className={`text-violet`}>Pronađi Željeni Tag</h2>
            <TagPicker
                selectedTags={selectedTags}
                maxNumberOfTags={1} 
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
            />
            <br></br>
            <button className={`text-white text-center rounded-3 border-0 py-2 px-2 ${styles.slova} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`} 
                                onClick={handleOpenEditModal}
                                disabled={!selectedTags.length}>Ažuriraj</button>
            <button className={`text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova} ${styles.dugme3} ${styles.linija_ispod_dugmeta}`} 
                                onClick={handleDeleteTag}              
                                disabled={!selectedTags.length}>Obriši</button>
            {modalVisible && tagToEdit && (
              <div className={`modal fade show`} style={{ display: 'block', zIndex: 1050 }} id="editTagModal" tabIndex={-1} aria-labelledby="editTagModalLabel" aria-hidden="true">
                <div className={`modal-dialog`}>
                  <div className={`modal-content`}>
                    <div className={`modal-header`}>
                      <h5 className={`modal-title text-lilac`} id="editTagModalLabel">Ažuriraj Tag</h5>
                      <button type="button" className={`btn-close`} data-bs-dismiss="modal" aria-label="Close" onClick={() => setModalVisible(false)} />
                    </div>
                    <div className={`modal-body`}>
                      <div className={`mb-3`}>
                        <label htmlFor="tagName" className={`form-label text-dark-green`}>Naziv Taga</label>
                        <input
                          type="text"
                          id="tagName"
                          className={`form-control`}
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>
                      <div className={`mb-3`}>
                        <label htmlFor="tagDescription" className={`form-label text-dark-green`}>Opis Taga</label>
                        <textarea
                          id="tagDescription"
                          className={`form-control`}
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={`modal-footer`}>
                      <button type="button" className={`text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova} ${styles.dugme3} ${styles.linija_ispod_dugmeta}`} onClick={() => setModalVisible(false)}>
                        Zatvori
                      </button>
                      <button type="button" className={`text-white text-center rounded-3 border-0 py-2 px-2 ${styles.slova} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`} onClick={handleUpdateTag}>
                        Ažuriraj
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
