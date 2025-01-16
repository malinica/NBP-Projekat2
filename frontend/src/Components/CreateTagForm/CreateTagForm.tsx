import React, { useState } from "react";
import { createTagAPI } from "../../Services/TagService.tsx"; 
import { toast } from "react-hot-toast";
import styles from "./CreateTagForm.module.css";

export const CreateTagForm = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error("Molimo popunite sva polja.");
      return;
    }

    try {
      const response = await createTagAPI(name, description);
      if (response && response.status === 200) {
        toast.success("Tag je uspešno kreiran!");
        setName('');
        setDescription('');
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Došlo je do greške prilikom kreiranja taga.");
    }
  };

  return (
    <div className={`d-flex justify-content-start flex-grow-1 my-4 rounded-3`}>
      <div className={`col-12 my-4 ms-2 p-4 bg-light-green rounded-3 mt-5`}>
        <h2 className={`text-center mb-4 text-dark-green`}>Kreiraj Tag</h2>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={`mb-3`}>
            <label className={`form-label text-violet`}>Ime taga:</label>
            <input
              type="text"
              className={`form-control ${styles.fields}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesite ime taga"
              required
            />
          </div>
          <div className={`mb-3`}>
            <label className={`form-label text-violet`}>Opis taga:</label>
            <textarea
              className={`form-control ${styles.fields}`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Unesite opis taga"
              required
            />
          </div>
          <button type="submit" className={`mt-5 btn-lg text-white text-center rounded-3 border-0 py-2 px-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}>
            Kreiraj Tag
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTagForm;
