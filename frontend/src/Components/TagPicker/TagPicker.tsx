import {Tag} from "../../Interfaces/Tag/Tag.ts";
import {useState} from "react";
import {getTagsByNameAPI} from "../../Services/TagService.tsx";
import {toast} from 'react-hot-toast';
import {Autocomplete, Box, Button, Chip, TextField} from "@mui/material";

type Props = {
    selectedTags: Tag[];
    onAddTag: (tag: Tag) => void;
    onRemoveTag: (tagId: string) => void;
}

export const TagPicker = ({selectedTags, onAddTag, onRemoveTag} : Props) => {

    const [inputValue, setInputValue] = useState("");
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
        <div className="container mt-3">
            <div className="mb-2">
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

            <button
                className="btn btn-primary mt-2"
                onClick={handleAddTag}
                disabled={!selectedTag}
            >
                Dodaj tag
            </button>

            <div className="mt-3 d-flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                    <Chip key={tag.id} label={tag.name} onDelete={() => onRemoveTag(tag.id)} color="primary"/>
                ))}
            </div>
        </div>
    );
};