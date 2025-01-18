import { useEffect, useState } from "react";
import { Review } from "../../Interfaces/Review/Review";
import styles from "./ReviewCard.module.css";
import toast from "react-hot-toast";
import {deleteReviewAPI,updateReviewAPI} from "../../Services/ReviewService";
import { useAuth } from "../../Context/useAuth";
import { Rating } from "@mui/material";
import { useNavigate } from "react-router-dom";


type ReviewCardProps = {
  review: Review;
  onDelete: () => void; 
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onDelete }) => {
const [reviewState, setReviewState] = useState<Review>(review);  
const [edit,setEdit]=useState<boolean>(false);
const [editedText,setEditedText]=useState<string|null>(null);
const [editedRating,setEditedRating]=useState<number>(review.rating);
const { user } = useAuth();
const navigate = useNavigate();


useEffect(() => {}, [reviewState]);

const handleDelete = () => {

    deleteReview(review.id);
};

const handleEdit = () => {
  setEdit(true);
  setEditedText(reviewState.content); 
  setEditedRating(reviewState.rating);
};


const deleteReview = async (reviewId: string) => {
    const result = await deleteReviewAPI(reviewId);
    if (result) {
        toast.success("Recenzija je uspešno obrisana.");
        onDelete();

    } else {
        toast.error("Greška prilikom brisanja recenzije.");
    }
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
  
      setReviewState((prevState) => ({
        ...prevState,
        content: updatedReviewData.content,
        rating: updatedReviewData.rating,
        updatedAt: updatedReviewData.updatedAt, 
      }));
    } else {
      toast.error("Greška prilikom ažuriranja recenzije.");
    }
  };
  


return (
  
    <div className={styles.reviewCard}>
      <div className={styles.reviewContent}>
        <div className={styles.rating}>
        {reviewState.author != undefined  && (
  <a 
    onClick={() => navigate(`/profile-page/${reviewState.author!.username}`)}
    className={styles['custom-dropdown-item1']}
  >
    Autor: {reviewState.author.username}
  </a>
)}
  {reviewState.updatedAt && reviewState.createdAt !== reviewState.updatedAt ? (
                <span>Izmenjeno: {new Date(reviewState.updatedAt).toLocaleString('sr-RS', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                })}</span>
            ) : (
                <span>Napisano: {new Date(reviewState.createdAt).toLocaleString('sr-RS', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                })}</span>
            )}
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
          <p>{reviewState.content}</p> 
        )}
      </div>

      {user && user.username == reviewState.author?.username && (
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