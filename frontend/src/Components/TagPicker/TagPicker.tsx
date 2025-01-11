import {Tag} from "../../Interfaces/Tag/Tag.ts";
import {useState} from "react";
import {getTagsByNameAPI} from "../../Services/TagService.tsx";
import {toast} from 'react-hot-toast';
import {Autocomplete, Chip, TextField} from "@mui/material";
import styles from "./TagPicker.module.css";


type Props = {
    selectedTags: Tag[];
    onAddTag: (tag: Tag) => void;
    onRemoveTag: (tagId: string) => void;
}

export const TagPicker = ({selectedTags, onAddTag, onRemoveTag} : Props) => {

    const [, setInputValue] = useState("");
    const [options, setOptions] = useState<Tag[]>([]);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

    const handleAddTag = () => {
        if (selectedTag && !selectedTags.some((tag) => tag.id === selectedTag.id)) {
            onAddTag(selectedTag);
            setSelectedTag(null);
            setInputValue("");
        }
    }

    const handleSearch = async (tagName: string) => {
        if (tagName.length > 1) {
            try {
                const response = await getTagsByNameAPI(tagName);
                if(response && response.status === 200) {
                    setOptions(response.data);
                }
            }
            catch(error) {
                toast.error("Došlo je do greške prilikom pretrage tagova.");
                console.error(error);
            }
        } else {
            setOptions([]);
        }
    };

    return (
        <div className={`mt-3`}>
            <div className={`mb-2`}>
                <Autocomplete
                    options={options}
                    getOptionLabel={(option) => option.name}
                    filterOptions={(x) => x}
                    onInputChange={async (_, newInputValue) => {
                        setInputValue(newInputValue);
                        await handleSearch(newInputValue);
                    }}
                    onChange={(_, newValue) => setSelectedTag(newValue)}
                    renderInput={(params) => <TextField {...params} label="Dodaj tag" variant="outlined" fullWidth/>}
                />
            </div>

            <div className={`d-flex align-items-center gap-3 mt-3`}>
                <button
                    className={`btn-lg text-white text-center rounded py-2 px-2 flex-shrink-0 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                    onClick={handleAddTag}
                    disabled={!selectedTag}
                    type="button"
                >
                    Dodaj Tag
                </button>

                <div className={`mt-3 d-flex flex-wrap gap-2`}>
                {selectedTags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} onDelete={() => onRemoveTag(tag.id)} color="success"/>
                ))}
                </div>
            </div>
        </div>
    );
};