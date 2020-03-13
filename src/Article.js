import React, {useState, useEffect} from 'react';
import { Editor} from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'bootstrap/dist/css/bootstrap.min.css';
const axios = require('axios').default;

function Articles(props){
    const [wygState, setwygState] = useState(EditorState.createEmpty());
    const [article, setArticle] = useState([]);
    const [articleId, setArticleId] = useState('');
    const [spinner, setSpinner] = useState(false);
    const[cspinner, setCSpinner] = useState(false);
    const [commentlist, setCommentList] = useState({});
    const [comment, setComment] = useState({postid:'', text:'', by:''})
    const [visits, setVisits] = useState(0);
    const artileComments = ()=>{
        if(articleId.length === 0) return [];
        return Object.keys(commentlist).filter(x=>x.indexOf(articleId) > -1).map(x=>commentlist[x])
    }
    const loadComments = ()=>{
        axios.get('https://us-central1-burghindian.cloudfunctions.net/allComments').then(res=>{
            setCommentList(res.data);
        });
    }
    const saveComment = ()=>{
        setCSpinner(true);
        const newcomment = {postid: comment.postid, comment:{text:comment.text, by:comment.by, when:(new Date()).toLocaleString()}};
        axios.post('https://us-central1-burghindian.cloudfunctions.net/createComment', newcomment).then(res=>{
            debugger;
            setComment({...comment, text:'', by:''});
            setCSpinner(false);
            loadComments();
        })
    };
    useEffect(()=>{
        loadComments();
    }, [])
    useEffect(()=>{
        if(articleId.length > 0)
        {
            setSpinner(true);
            axios.get(`https://us-central1-burghindian.cloudfunctions.net/showArticle?articleid=${articleId}`).then(response=>{
                setwygState(EditorState.createWithContent(convertFromRaw(JSON.parse(response.data.article.article))));
                setVisits(response.data.visits);
                setSpinner(false);
                setComment({...comment, postid:articleId})
            });
        }
    }, [articleId]);
    useEffect(()=>{
        axios.get('https://us-central1-burghindian.cloudfunctions.net/applicationHome').then(response=>{
            //debugger;
            setArticle(response.data["home-page-articles"]);
        })
    }, []);
    const editorStateChg = newstate=>{
        setwygState(newstate);
    }
    return (
       
        <div className="row" style={{margin:"30px"}}>
            <div className="col-lg-6">
                {article.map(item=>
                    <div className="input-group-prepend mb-1" key={item.key}>
                        <div className="input-group-text">
                            {spinner && (articleId === item.entry.postid) && <span className="spinner-border spinner-border-sm"></span>}
                            <input type="radio" checked={articleId === item.entry.postid} onChange={e=>setArticleId(item.entry.postid)} />
                        </div>
                        <span className="input-group-text">{item.entry.heading}</span>
                        {!spinner && (articleId === item.entry.postid) && 
                        <span className="input-group-text">visits : {visits}</span>}
                    </div>
                )}
            </div>
            <div className="col-lg-10">
                <Editor editorState={wygState} wrapperClassName="card" editorClassName="card-body wysiwyg editor-images" readOnly={true} toolbarHidden={false}
                    onEditorStateChange={editorStateChg} />
            </div>
            {comment.postid.length> 0 && <div className="col-lg-2">
                <div className="card ">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item" style={{"padding":"5px"}}>
                            <textarea rows="6" style={{"width":"100%"}} value={comment.text} onChange={e=>setComment({...comment, text:e.target.value})} ></textarea>
                            <div className="input-group mb-1">
                                <input type="text" className="form-control" placeholder="user name" value={comment.by} onChange={e=>setComment({...comment, by:e.target.value})} />
                                <div className="input-group-append">
                                    <button className="btn-success" onClick={saveComment}>
                                    {cspinner && <span className="spinner-border spinner-border-sm"></span>}Save</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                {articleId && <div>
                    {
                        artileComments().map(each=>
                            <blockquote key={each.when}>
                                <span>{each.text}</span>
                                <footer className="blockquote-footer">{each.by}</footer>
                                <footer className="blockquote-footer">{each.when}</footer>
                            </blockquote>
                        )
                    }
                </div>}
            </div>}
         </div>
        
    )
}
export default Articles;