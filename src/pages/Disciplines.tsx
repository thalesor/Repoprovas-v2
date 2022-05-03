import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  Typography,
  CircularProgress
} from "@mui/material";

import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  async function loadPage()
  {
    setLoading(true);
    if (!token) return;
      
    const { data: testsData } = await api.getTestsByDiscipline(token, search && `${search}`);
    setTerms(testsData.tests);
    const { data: categoriesData } = await api.getCategories(token);
    setCategories(categoriesData.categories);
    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, [token]);

  return (
    <>
      <FormControl sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">Pesquise por disciplinas</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type="text"
            label="Pesquise por disciplinas"
            value={search}
            onChange={(e : React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={()=> loadPage()}
                  edge="end"
                  color="primary"
                >
                  <SearchIcon/>
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      
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
            sx={{
              height: "36.5px",
              width: "119px"
            }}
            variant="contained"
            disabled={loading}
            onClick={() => navigate("/app/disciplinas")}
          >
            {loading ? <CircularProgress color="secondary"/> : 'DISCIPLINAS'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            PROFESSORES
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} />
      </Box>
    </>
  );

  interface TermsAccordionsProps {
    categories: Category[];
    terms: TestByDiscipline[];
  }
  
  function TermsAccordions({ categories, terms }: TermsAccordionsProps) {
    return (
      <Box sx={{ marginTop: "50px" }}>
        {terms.map((term) => (
          
          <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">{term.number}º Período ({term.disciplines.length < 1 ? 'Não há provas' : `${getTestsCountFromTerm(term)} provas`})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DisciplinesAccordions
                categories={categories}
                disciplines={term.disciplines}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }
  
  interface DisciplinesAccordionsProps {
    categories: Category[];
    disciplines: Discipline[];
  }
  
  function DisciplinesAccordions({
    categories,
    disciplines,
  }: DisciplinesAccordionsProps) {
    if (disciplines.length === 0)
      return <Typography>Nenhuma prova para esse período...</Typography>;
  
    return (
      <>
        {disciplines.map((discipline) => (
          <Accordion
            sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
            key={discipline.id}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">{discipline.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Categories
                categories={categories}
                teachersDisciplines={discipline.teacherDisciplines}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    );
  }
  
  interface CategoriesProps {
    categories: Category[];
    teachersDisciplines: TeacherDisciplines[];
  }
  
  function Categories({ categories, teachersDisciplines }: CategoriesProps) {
    if (teachersDisciplines[0].tests.length === 0)
      return <Typography>Nenhuma prova para essa disciplina...</Typography>;
  
    return (
      <>
        {categories
          .filter(doesCategoryHaveTests(teachersDisciplines))
          .map((category) => (
            <Box key={category.id}> 
              <Typography fontWeight="bold">{category.name}</Typography>
              <TeachersDisciplines
                categoryId={category.id}
                teachersDisciplines={teachersDisciplines}
              />
            </Box>
          ))}
      </>
    );
  }
  
  interface TeacherDisciplineProps {
    teachersDisciplines: TeacherDisciplines[];
    categoryId: number;
  }
  
  function getTestsCountFromTerm(term: TestByDiscipline)
  {
    let count = 0;
    term.disciplines.forEach((discipline) => count += discipline.teacherDisciplines[0].tests.length);
    return count;
  }

  function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
    return (category: Category) =>
      teachersDisciplines.filter((teacherDiscipline) =>
        someTestOfCategory(teacherDiscipline.tests, category.id)
      ).length > 0;
  }
  
  function someTestOfCategory(tests: Test[], categoryId: number) {
    return tests.some((test) => test.category.id === categoryId);
  }
  
  function testOfCategory(test: Test, categoryId: number) {
    return test.category.id === categoryId;
  }
  
  function TeachersDisciplines({
    categoryId,
    teachersDisciplines,
  }: TeacherDisciplineProps) {
    const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
      tests: teacherDiscipline.tests,
      teacherName: teacherDiscipline.teacher.name,
    }));
  
    return (
      <Tests categoryId={categoryId} testsWithTeachers={testsWithDisciplines} />
    );
  }
  
  interface TestsProps {
    testsWithTeachers: { tests: Test[]; teacherName: string }[];
    categoryId: number;
  }

  interface TestComponentProps {
    testsWithDisciplines: { teacherName: string };
    test: Test;
  }

  function TestComponent({test, testsWithDisciplines}: TestComponentProps) {
    const [views, setViews] = useState(test.views);
    return (
      <Box sx={{ backgroundColor: "#E9F7EF", display: "flex", gap: 1}}>
        <Typography key={test.id} color="#878787">
            <Link
              href={test.pdfUrl}
              onClick={async () => {

                const {
                  data: { views } 
                } = await api.updateTestViews(test.id, token);
  
               setViews(views);
              }
            }
              target="_blank"
              underline="none"
              color="inherit"
            >{`${test.name} (${testsWithDisciplines.teacherName})`}
            </Link>
        </Typography>
        {typeof views === 'number' &&
        views > 0 && 
        <>
          <VisibilityIcon color="primary"/>
          <Typography key={test.id} color="primary">
              {views}
          </Typography>
        </>
      }
      </Box>
      )
  }

  function Tests({
    categoryId,
    testsWithTeachers: testsWithDisciplines,
  }: TestsProps) {
    return (
      <>
        {testsWithDisciplines.map((testsWithDisciplines) =>
          testsWithDisciplines.tests
            .filter((test) => testOfCategory(test, categoryId))
            .map((test) => 
              <TestComponent test={test} testsWithDisciplines={testsWithDisciplines}/>
            )
        )}
      </>
    );
  }
}


export default Disciplines;
