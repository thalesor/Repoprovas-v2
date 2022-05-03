import {
  Box,
  Button,
  Divider,
  Typography,
  TextField
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import { AxiosError } from "axios";
import Form from "../components/Form";
import useAlert from "../hooks/useAlert";
import api, {
    Category,
    Teacher,
    Discipline
  } from "../services/api";

  import MenuItem from '@mui/material/MenuItem';
  import Select, { SelectChangeEvent } from '@mui/material/Select';
  import InputLabel from '@mui/material/InputLabel';
  import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';

const styles = {
    container: {
      width: "700px",
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
      justifyContent: 'center'
    },
    title: { marginBottom: "30px", textAlign: "center" },
    dividerContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "16px",
      marginBottom: "26px",
    },
    input: { marginBottom: "16px" },
    buttons: { width: '100%'},
    actionsContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };

  interface FormData {
    name: string | undefined;
    pdfUrl?: string | undefined;
    categoryId?: string | undefined;
    disciplineId?: string | undefined;
    teacherId?: string | undefined;
  }

function Test() {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    async function loadPage() {
      if (!token) return;
      
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);

      const { data: disciplinesData } = await api.getDisciplines(token);
      setDisciplines(disciplinesData.disciplines);
     
    }
    loadPage();
  }, [token]);

  async function loadTeachersByDiscipline(token: string, disciplineId: number)
  {
    const { data: teachersData } = await api.getTeachersByDiscipline(token, disciplineId);
      const teachersList = teachersData.teachers.map((item) => { return { ...item.teacher } })
      setTeachers(teachersList);
  }

  const { setMessage } = useAlert();
  const [formData, setFormData] = useState<FormData>({
    name: undefined,
    pdfUrl: undefined,
    categoryId: undefined,
    disciplineId: undefined,
    teacherId: undefined
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {

    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
      
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(e.target.name === "disciplineId")
    {
      if(typeof token === "string")
      loadTeachersByDiscipline(token, Number(e.target.value));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if(Object.values(formData).includes(undefined)) 
     {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
      return;
    }
    
    try {
      await api.postTest(formData, token);
      setMessage({ type: "success", text: "Teste cadastrado com sucesso!" });
      navigate(-1);
    } catch (error: Error | AxiosError | any) {
      if (error.response) {
        setMessage({
          type: "error",
          text: error.response.data,
        });
        return;
      }
      setMessage({
        type: "error",
        text: "Erro, tente novamente em alguns segundos!",
      });
    }

  }

  return (
    <>
      <Typography sx={styles.title} variant="h5" component="h1">
          Adicione uma prova
        </Typography>
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            PROFESSORES
          </Button>
          <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>

        <Form onSubmit={handleSubmit}>
      <Box sx={styles.container}>

      <TextField
          name="name"
          sx={styles.input}
          label="Título da prova"
          type="text"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.name}
        />

        <TextField
          name="pdfUrl"
          sx={styles.input}
          label="PDF da prova"
          type="text"
          variant="outlined"
          onChange={handleInputChange}
          value={formData.pdfUrl}
        />
         
        
        <FormControl sx={styles.input}>
        <InputLabel id="select-category-label">Categoria</InputLabel>
        <Select
        name="categoryId"
        input={<OutlinedInput id="select-category" label="Categoria" />}
          label="Categoria da prova"
          id="category"
          value={formData.categoryId}
          onChange={handleSelectChange}
        >
          {categories.map((category) => { return <MenuItem value={category.id}>{category.name}</MenuItem> })} 
        </Select>
      </FormControl>

      <FormControl sx={styles.input}>
        <InputLabel id="select-category-label">Disciplina</InputLabel>
        <Select
        name="disciplineId"
        input={<OutlinedInput id="select-category" label="Disciplina" />}
          label="Disciplina da prova"
          id="disciplina"
          value={formData.disciplineId}
          onChange={handleSelectChange}
        >
          {disciplines.map((discipline) => { return <MenuItem value={discipline.id}>{discipline.name}</MenuItem> })} 
        </Select>
      </FormControl>

      <FormControl sx={styles.input}>
        <InputLabel id="select-category-label">Professor</InputLabel>
        <Select
        name="teacherId"
        disabled = {teachers.length < 1}
        input={<OutlinedInput id="select-teacher" label="Professor" />}
          label="Professor responsável"
          id="teacher"
          value={formData.teacherId}
          onChange={handleSelectChange}
        >
          {teachers.map((teacher) => { return <MenuItem value={teacher.id}>{teacher.name}</MenuItem> })} 
        </Select>
      </FormControl>

        <Box sx={styles.actionsContainer}>
          <Button variant="contained" sx={styles.buttons} type="submit">
            ENVIAR
          </Button>
        </Box>
      </Box>
    </Form>
      </Box>
    </>
  );
}

export default Test;
