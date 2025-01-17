import { useEffect, useState } from "react";
import { Review } from "../../Interfaces/Review/Review";
import styles from "./ReviewCard.module.css";
import toast from "react-hot-toast";
import {deleteReviewAPI,updateReviewAPI} from "../../Services/ReviewService";
import { useAuth } from "../../Context/useAuth";
import { Rating } from "@mui/material";



const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
const [reviewState, setReviewState] = useState<Review>(review);  
const [edit,setEdit]=useState<boolean>(false);
const [editedText,setEditedText]=useState<string|null>(null);
const [editedRating,setEditedRating]=useState<number>(review.rating);
const { user } = useAuth();

useEffect(() => {
    console.log("Loaded review:", reviewState);
  }, [reviewState]);



const handleDelete = () => {

    deleteReview(review.id);
};

const deleteReview = async (reviewId: string) => {
    const result = await deleteReviewAPI(reviewId);
    if (result) {
        console.log("Recenzija je uspešno obrisana.");
    } else {
        console.log("Greška prilikom brisanja recenzije.");
    }
};

const handleEdit = () => {
    setEdit(true);
    setEditedText(review.content); 
  };

  const handleSave = async () => {
    if ((review.content === editedText && review.rating === editedRating) || editedRating < 0 || editedRating > 5)
        toast.error("Podaci nisu odgovarajući");
    else
    {
        const updatedReview = {
            id: review.id,
            rating: editedRating,
            content: editedText? editedText : "",
            createdAt: review.createdAt,
            updatedAt: new Date()
        };
        await updateReview(review.id,updatedReview);
        
    }
    setEdit(false);
  };
  const updateReview = async (reviewId: string, updatedReviewData: Review) => {
    const result = await updateReviewAPI(reviewId, updatedReviewData);
    if (result) {
        toast.success("Recenzija je uspešno ažurirana.");
        setReviewState(updatedReviewData);
        
    } else {
        toast.error("Greška prilikom ažuriranja recenzije.");
    }
};

useEffect(() => {console.log("REVIEW JE"+ reviewState); console.log("USER JE"+ user?.username)}, [reviewState]);

return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewContent}>
        <div className={styles.rating}>
        <Rating
    name="simple-controlled"
    value={editedRating}
    onChange={(_, newValue) => {
        setEditedRating(newValue? newValue : 0);
    }}
/>
<span>{editedRating}</span>
        </div>

        {edit ? (
          <textarea
            value={editedText ?? ""}
            onChange={(e) => setEditedText(e.target.value)} 
            className={styles.textarea}
          />
        ) : (
          <p>{review.content}</p> 
        )}
      </div>

      {user && user.username === reviewState.author?.username && (
        <div className={styles.buttons}>
          {edit ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={handleEdit}>Edit</button>
          )}
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
);

};
export default ReviewCard;