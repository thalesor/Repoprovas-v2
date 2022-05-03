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
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);

  async function loadPage() {
    setLoading(true);
    if (!token) return;

    const { data: testsData } = await api.getTestsByTeacher(token, search && `${search}`);
    setTeachersDisciplines(testsData.tests);
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
          <InputLabel htmlFor="outlined-adornment-password">Pesquise por professores</InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type="text"
            label="Pesquise por professores"
            value={search}
            onChange={(e : React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="procure por professores"
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
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            DISCIPLINAS
          </Button>
         
          <Button
            sx={{
              height: "36.5px",
              width: "119px"
            }}
            variant="contained"
            disabled={loading}
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            {loading ? <CircularProgress color="secondary"/> : 'PROFESSORES'}
          </Button>

          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
        />
      </Box>
    </>
  );

  interface TeachersDisciplinesAccordionsProps {
    teachersDisciplines: TestByTeacher[];
    categories: Category[];
  }
  
  function TeachersDisciplinesAccordions({
    categories,
    teachersDisciplines,
  }: TeachersDisciplinesAccordionsProps) {
    const teachers = getUniqueTeachers(teachersDisciplines);
  
    return (
      <Box sx={{ marginTop: "50px" }}>
        {teachers.map((teacher) => (
          <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight="bold">{teacher}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {categories
                .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
                .map((category) => (
                  <Categories
                    key={category.id}
                    category={category}
                    teacher={teacher}
                    teachersDisciplines={teachersDisciplines}
                  />
                ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }
  
  function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
    return [
      ...new Set(
        teachersDisciplines.map(
          (teacherDiscipline) => teacherDiscipline.teacher.name
        )
      ),
    ];
  }

  function TestComponent({test, disciplineName}: TestComponentProp) {
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
          >{`${test.name} (${disciplineName})`}</Link>
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
  
  function doesCategoryHaveTests(
    teacher: string,
    teachersDisciplines: TeacherDisciplines[]
  ) {
    return (category: Category) =>
      teachersDisciplines.filter(
        (teacherDiscipline) =>
          teacherDiscipline.teacher.name === teacher &&
          testOfThisCategory(teacherDiscipline, category)
      ).length > 0;
  }
  
  function testOfThisCategory(
    teacherDiscipline: TeacherDisciplines,
    category: Category
  ) {
    return teacherDiscipline.tests.some(
      (test) => test.category.id === category.id
    );
  }
  
  interface CategoriesProps {
    teachersDisciplines: TeacherDisciplines[];
    category: Category;
    teacher: string;
  }
  
  function Categories({
    category,
    teachersDisciplines,
    teacher,
  }: CategoriesProps) {
    return (
      <>
        <Box sx={{ marginBottom: "8px" }}>
          <Typography fontWeight="bold">{category.name}</Typography>
          {teachersDisciplines
            .filter(
              (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
            )
            .map((teacherDiscipline) => (
              <Tests
                key={teacherDiscipline.id}
                tests={teacherDiscipline.tests.filter(
                  (test) => test.category.id === category.id
                )}
                disciplineName={teacherDiscipline.discipline.name}
              />
            ))}
        </Box>
      </>
    );
  }
  
  interface TestsProps {
    disciplineName: string;
    tests: Test[];
  }

  interface TestComponentProp {
    disciplineName: string;
    test: Test;
  }
  
  function Tests({ tests, disciplineName }: TestsProps) {
    return (
      <>
        {tests.map((test: Test) =>  { 
          return (
          <TestComponent test={test} disciplineName={disciplineName}/>
        )}
        )}
      </>
    );
  }
}

export default Instructors;
