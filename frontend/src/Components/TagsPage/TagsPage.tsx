import CreateTagForm from "../CreateTagForm/CreateTagForm"; 
import styles from "./TagsPage.module.css";
import { TagPicker } from "../TagPicker/TagPicker";

const TagsPage = () => {

  return (
    <div className={`container-fluid bg-lilac d-flex justify-content-start flex-grow-1`}>
      <div className={`row container-fluid d-flex justify-content-center my-4`}>
        <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12`}>
          <CreateTagForm/>
        </div>
        <div className={`col-xxl-6 col-xl-6 col-lg-6 col-md-12 col-sm-12`}>
          <button className={`btn-lg text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`}>Ažuriraj</button>
          <button className={`btn-lg text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova} ${styles.dugme3} ${styles.linija_ispod_dugmeta}`}>Obriši</button>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
