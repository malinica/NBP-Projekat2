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
    <div className={``}>
      <div className={`rounded-3 bg-light-lilac my-3 px-2`}>
        <div className={`row d-flex justify-content-beetwen align-items-start`}>
          <div className={`col-xxl-9 col-xl-9 col-lg-9 col-md-9 col-sm-9`}>
            {reviewState.author != undefined  && (
              <a 
                onClick={() => navigate(`/profile-page/${reviewState.author!.username}`)}
                className={`text-violet fw-bold me-2 ${styles.linija_ispod_dugmeta}`}
              >
                {reviewState.author.username}
              </a>
            )}
            {reviewState.updatedAt && reviewState.createdAt !== reviewState.updatedAt ? (
                <span className={`text-green`}>Izmenjeno: {new Date(reviewState.updatedAt).toLocaleString('sr-RS', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                })}</span>
            ) : (
                <span className={`text-green`}>Napisano: {new Date(reviewState.createdAt).toLocaleString('sr-RS', {
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                })}</span>
            )}
            <div className={`d-flex`}>
              <Rating
                name="simple-controlled"
                value={editedRating}
                onChange={(_, newValue) => {
                    setEditedRating(newValue? newValue : 0);
                }}
              />
              <span className={`ms-2 text-dark-green`}>{editedRating}</span>
            </div>
        
            {edit ? (
              <textarea
                value={editedText ?? ""}
                onChange={(e) => setEditedText(e.target.value)} 
                className={``}
              />
            ) : (
              <p>{reviewState.content}</p> 
            )}
          </div>

          <div className={`col-1`}></div>

          {user && user.username == reviewState.author?.username && (
            <div className={`col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-2 d-flex justify-content-end align-items-end mt-auto`}>
              {edit ? (
                <button className={`text-white text-center rounded-3 border-0 py-2 px-2 mb-2 ${styles.slova2} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`} onClick={handleSave}>Save</button>
              ) : (
                <button className={`text-white text-center rounded-3 border-0 py-2 px-2 mb-2 ${styles.slova2} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`} onClick={handleEdit}>Edit</button>
              )}
              <button className={`text-white text-center rounded-3 border-0 py-2 px-2 mb-2 ms-2 ${styles.slova2} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`} onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;