import axios from "axios";
import "./App.css";
import { useCallback, useEffect, useState } from "react";
axios.defaults.withCredentials = true;

function App() {
    const port = 'https://testpdqo-28c22dccc824.herokuapp.com'
    
    //쿠키가져오기
    const [userCookie, setUserCookie] = useState('');
    const userC = ()=>{
        const tokenCookie = document.cookie.split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith('token='));
        setUserCookie(tokenCookie);
    }
     //처음 로딩시 실행
    useEffect(()=>{
        userC();
        selectAll();
    },[])
    //데이터 불러오기
    const [movie, setMovie] = useState([]);
    const selectAll = useCallback( () => {
        axios.get(`${port}/movies`).then((result)=>{
            setMovie(result.data);
        }).catch((er)=>{
            console.log(er);
        })
    },[]);
    //상세데이터 불러오기
    const [movieDetail, setMovieDetail] = useState(null);
    const showMovieDetail = async (e, id) => {
        const result = await axios.get(`${port}/movies/${id}`);
        setMovieDetail(result.data[0]);
    };
    //폼 작성
    const [formData, setFormData]=useState({name:'',capital:'',population:'',date:''});
    const handleChange = (e)=>{
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        setFormData({...formData, [e.target.name]:e.target.value,date:formattedDate})
    }
    //폼 서버 보네기
    const handleSubmit =  (e)=>{
        e.preventDefault();
        e.stopPropagation();
        axios.post(`${port}/api/save`, formData).then(()=>{
            selectAll();
        }).catch(er=>{
            console.log(er);
            alert('로그인 해주세요.')
        })
    }
    //삭제
    const handleDelete = (e, id)=>{
        e.stopPropagation();
        console.log(id);
        axios.delete(`${port}/api/delete/${id}`).then(()=>{
            selectAll();
        }).catch(er=>{
            console.log(er);
            alert('로그인 해주세요');
        })
    }
    //회원가입 벨류업데이트
    const [register, setRegister] = useState({id:'', password:''});
    const handleChangeRegister = (e)=>{
        setRegister({...register, [e.target.name]:e.target.value});
    }
    //가입
    const handleRegister = ()=>{
        if(register.id === ''){
            alert('id를 채워주세요');
            return
        }
        if(register.password === ''){
            alert('password를 채워주세요');
            return
        }
        axios.post(`${port}/api/register`, register).then((res)=>{
            console.log('res => ', res);
            alert('회원가입 완료되었습니다.')
        }).catch(er=>{
            console.log(er.response)
            alert('다른 id를 사용해주세요.')
        });
    }
    //로그인
    const [login, setLogin] = useState({id:'',password:'' });

    const handlelogin = (e)=>{
        setLogin({...login, [e.target.name]:e.target.value,})
    }
    const handleloginEnter = ()=>{
        axios.post(`${port}/api/login`,login)
        .then(res=>{
            const user_id = res.data.user_id;
            console.log(user_id);
            setUserCookie(user_id);
            localStorage.setItem('user_id',user_id);
        })
        .catch(er=>{
            console.log(er.response);
            alert(er.response.data);
        });
    }
    //로그아웃
    const handleLogout = ()=>{
        function deleteCookie(cookieName) {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
        deleteCookie('token'); 
        setUserCookie('');
        localStorage.removeItem('user_id');
    }
    return (
        <div id="App">
            <h1>react-express-mysql connection</h1>
            {
                userCookie ? ''
                :
                <div className="registerForm">
                    <h4>회원가입</h4>
                    <input type="text" placeholder="id" name="id" value={register.id} onChange={handleChangeRegister}/>
                    <input type="password" placeholder="password" name="password" value={register.password} onChange={handleChangeRegister}/>
                    <button onClick={handleRegister}>가입</button>
                </div>
            }
            {
                userCookie ?
                    <button onClick={handleLogout}>로그아웃</button>
                :
                    <div className="registerForm">
                        <h4>로그인</h4>
                        <input type="text" placeholder="id" name="id" value={login.id} onChange={handlelogin}/>
                        <input type="password" placeholder="password" name="password" value={login.password} onChange={handlelogin}/>
                        <button onClick={handleloginEnter}>로그인</button>
                    </div>
            }
            <form>
                <input type="text" placeholder="name" name="name" value={formData.name} onChange={handleChange}/>
                <input type="text" placeholder="capital" name="capital" value={formData.capital} onChange={handleChange}/>
                <input type="text" placeholder="population" name="population" value={formData.population} onChange={handleChange}/>
                <button onClick={handleSubmit}>등록</button>
            </form>
            <button onClick={selectAll}>모두조회</button>
            <section>
                {movieDetail && 
                    <div>
                        <p>{movieDetail.id}</p>
                        <p>{movieDetail.name}</p>
                        <p>{movieDetail.capitai}</p>
                        <p>{movieDetail.population}</p>
                        <p>{movieDetail.user_id}</p>
                        <p>{movieDetail.date_}</p>
                    </div>
                }
            </section>
            <section>
                {movie.map((v) => (
                    <section
                        key={v.id}
                        className="pointer"
                        onClick={(e) => showMovieDetail(e, v.id)}
                        style={{display:'flex'}}
                    >
                        <h4>{v.id}</h4>
                        <p>{v.name}</p>
                        {
                            localStorage.getItem('user_id') === v.user_id ?
                                <button onClick={(e)=>handleDelete(e, v.id)}>delete</button>
                            : ''
                        }
                    </section>
                ))}
            </section>
        </div>
    );
}

export default App;
