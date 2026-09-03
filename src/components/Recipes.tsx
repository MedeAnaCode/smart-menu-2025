import {useState} from 'react';
import AddRecipeForm from './Add-recipe-form';
import EditRecipeForm from './Edit-recipe-form';
import {Modal} from './Modal';
import Sidebar from './Sidebar';
import ActionMenu, {type MenuAction} from './ActionMenu';
import {useCloneRecipeMutation,useDeleteRecipeMutation,useGetMyRecipesQuery,useGetRecipesQuery,usePublishRecipeMutation,useSaveRecipeMutation,useUnsaveRecipeMutation,useUnpublishRecipeMutation,useUpdateRecipeMutation} from '../apiRtk';
import type {Recipe} from '../types';
import RecipeImage from './RecipeImage';
import {useAuth} from '../auth/AuthContext';

const scaledAmount = (amount: string, selected: number, base: number) => {
    const numeric = Number(amount.replace(',', '.'));
    return !amount || !Number.isFinite(numeric) ? amount : String(Number((numeric * selected / Math.max(base, 1)).toFixed(2)));
};

type RecipeTileProps = {recipe: Recipe; mode: 'owned'|'saved'|'catalog'; alreadySaved?: boolean; authenticated: boolean; onEdit: (id: number) => void; onDetails: (recipe: Recipe) => void};
function RecipeTile({recipe,mode,alreadySaved,authenticated,onEdit,onDetails}: RecipeTileProps) {
    const [actionError,setActionError] = useState(''),[pending,setPending] = useState(false);
    const [deleteRecipe]=useDeleteRecipeMutation(),[publishRecipe]=usePublishRecipeMutation(),[unpublishRecipe]=useUnpublishRecipeMutation(),[saveRecipe]=useSaveRecipeMutation(),[unsaveRecipe]=useUnsaveRecipeMutation(),[cloneRecipe]=useCloneRecipeMutation();
    const runAction=async(action:()=>Promise<unknown>)=>{setActionError('');setPending(true);try{await action();}catch{setActionError('Действие не выполнено. Повторите попытку.');}finally{setPending(false);}};
    const actions: MenuAction[] = mode==='owned' ? [
        {label:'Редактировать',onSelect:()=>onEdit(recipe.id),disabled:pending},
        {label:recipe.isPublished?'Снять с публикации':'Опубликовать',onSelect:()=>void runAction(()=>recipe.isPublished?unpublishRecipe(recipe.id).unwrap():publishRecipe(recipe.id).unwrap()),disabled:pending},
        {label:'Удалить рецепт',danger:true,onSelect:()=>{if(window.confirm(`Удалить рецепт «${recipe.title}»?`))void runAction(()=>deleteRecipe(recipe.id).unwrap());},disabled:pending},
    ] : mode==='saved' ? [
        {label:'Создать свою копию',onSelect:()=>void runAction(()=>cloneRecipe(recipe.id).unwrap()),disabled:pending},
        {label:'Удалить из моих',onSelect:()=>void runAction(()=>unsaveRecipe(recipe.id).unwrap()),disabled:pending},
    ] : [];
    return <article className="recipes-container__card recipe-card" aria-busy={pending}>
        <button className="recipe-card__photo-button" type="button" onClick={()=>onDetails(recipe)} aria-label={`Открыть рецепт: ${recipe.title}`}><RecipeImage src={recipe.image} alt={recipe.title} className="recipe-card__img" /></button>
        <p className="recipe-card__category">{recipe.category}</p><h2 className="recipe-card__title"><button type="button" onClick={()=>onDetails(recipe)}>{recipe.title}</button></h2>
        <div className="recipe-card__footer"><span>{mode==='owned'?'Мой рецепт':mode==='saved'?'Сохранённый рецепт':recipe.author?.name||'Общий каталог'}{recipe.isPublished&&mode==='owned'?' · опубликован':''}</span><button type="button" className="ui-link" onClick={()=>onDetails(recipe)}>Состав →</button>{actions.length>0&&<ActionMenu label={`Действия: ${recipe.title}`} actions={actions}/>}</div>
        {mode==='catalog'&&authenticated&&!alreadySaved&&<button className="ui-link" type="button" disabled={pending} onClick={()=>void runAction(()=>saveRecipe(recipe.id).unwrap())}>В мои рецепты</button>}
        {mode==='catalog'&&alreadySaved&&<span className="recipe-card__saved-mark">Сохранён</span>}{actionError&&<p className="smartmenu-error" role="alert">{actionError}</p>}
    </article>;
}

export default function Recipes() {
    const [open,setOpen]=useState(false),[editingId,setEditingId]=useState<number|null>(null),[search,setSearch]=useState(''),[category,setCategory]=useState(''),[sideOpen,setSideOpen]=useState(false),[detailsId,setDetailsId]=useState<number|null>(null),[servings,setServings]=useState(1),[busy,setBusy]=useState(false);
    const auth=useAuth();
    const {data:catalog=[],isLoading:catalogLoading,isError:catalogError}=useGetRecipesQuery(search);
    const {data:mine,isLoading:mineLoading,isError:mineError}=useGetMyRecipesQuery(undefined,{skip:!auth.authenticated});
    const [updateRecipe]=useUpdateRecipeMutation();
    const owned=mine?.owned??[],saved=mine?.saved.map(item=>item.recipe).filter(Boolean)??[];
    const ownedIds=new Set(owned.map(r=>r.id)),savedIds=new Set(saved.map(r=>r.id));
    const collection=auth.authenticated?[...owned,...saved]:catalog;
    const categories=[...new Set(collection.map(r=>r.category))].sort();
    const matches=(r:Recipe)=>(!category||r.category===category)&&r.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
    const details=[...owned,...saved,...catalog].find(r=>r.id===detailsId);
    const closeModal=()=>{setEditingId(null);setOpen(false);};
    const edit=(id:number)=>{setSideOpen(false);setEditingId(id);setOpen(true);};
    const showDetails=(recipe:Recipe)=>{setDetailsId(recipe.id);setServings(recipe.servings);setSideOpen(true);};
    const add=()=>{setEditingId(null);setOpen(true);};
    const tile=(recipe:Recipe,mode:'owned'|'saved'|'catalog')=><RecipeTile key={`${mode}-${recipe.id}`} recipe={recipe} mode={mode} authenticated={auth.authenticated} alreadySaved={savedIds.has(recipe.id)} onEdit={edit} onDetails={showDetails}/>;
    return <div className="workspace">
        <div className="workspace__main">
            <div className="page-title-row"><h1>Мои рецепты</h1>{auth.authenticated&&<button className="button-dark" type="button" onClick={add}>+ Добавить рецепт</button>}</div>
            {!auth.authenticated&&<div className="auth-notice"><p>Войди, чтобы сохранять рецепты и собирать свою коллекцию.</p><button className="ui-link" onClick={()=>void auth.register()}>Зарегистрироваться</button></div>}
            <label className="recipe-search"><span className="visually-hidden">Поиск по названию</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Найти любимый рецепт"/></label>
            {auth.authenticated&&<section aria-label="Моя коллекция"><p className="recipe-count">Рецептов в коллекции: {collection.filter(matches).length}</p>
                {mineLoading&&<p role="status">Загружаем вашу коллекцию...</p>}{mineError&&<p className="smartmenu-error" role="alert">Не удалось загрузить коллекцию.</p>}
                {!mineLoading&&!mineError&&collection.filter(matches).length===0&&<p className="smartmenu-empty">{search||category?'По вашему запросу ничего не найдено.':'Коллекция пока пуста.'}</p>}
                <div className="recipes-container">{owned.filter(matches).map(r=>tile(r,'owned'))}{saved.filter(matches).map(r=>tile(r,'saved'))}<div className="recipe-invitation"><span className="chef-mark"><img src="/img/logo-image-mobile.svg" alt=""/></span><h2>Место для нового любимого блюда</h2><button className="ui-link" onClick={add}>Добавить свой рецепт →</button></div></div>
            </section>}
            <section className="recipe-catalog" aria-labelledby="catalog-title"><h2 id="catalog-title">Общий каталог</h2>
                {catalogLoading&&<p role="status">Загружаем каталог...</p>}{catalogError&&<p className="smartmenu-error" role="alert">Каталог временно недоступен.</p>}
                {!catalogLoading&&!catalogError&&catalog.filter(matches).length===0&&<p className="smartmenu-empty">По вашему запросу ничего не найдено.</p>}
                <div className="recipes-container">{catalog.filter(matches).map(r=>tile(r,ownedIds.has(r.id)?'owned':'catalog'))}</div>
            </section>
        </div>
        <Sidebar open={sideOpen} onOpenChange={setSideOpen}><section className="sidebar-section"><h3>Моя коллекция</h3><div className="recipe-categories"><button type="button" aria-pressed={!category} onClick={()=>{setCategory('');setSideOpen(false);}}>Все рецепты <span>{collection.length}</span></button>{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>{setCategory(c);setSideOpen(false);}}>{c}<span>{collection.filter(r=>r.category===c).length}</span></button>)}</div></section>
            <section className="sidebar-section recipe-details"><h3>Состав рецепта</h3>{!details?<p>Нажми «Состав» на карточке рецепта.</p>:<><h4>{details.title}</h4><p>{details.description}</p><label className="recipe-details__servings">Порций<input type="number" min="1" max="100" value={servings} onChange={e=>setServings(Math.min(100,Math.max(1,Number(e.target.value)||1)))}/></label><ul>{details.ingredients.map((item,i)=><li key={i}><span>{item.name}{item.custom&&<small>Свой ингредиент</small>}</span><span>{scaledAmount(item.amount,servings,details.servings)} {item.um}</span></li>)}</ul><h3>Приготовление</h3><p className="recipe-details__preparing">{details.preparing}</p>{details.author&&<p className="recipe-details__author">Автор: {details.author.name}</p>}</>}</section>
        </Sidebar>
        <Modal open={open} onOpenChange={next=>{if(!next)closeModal();else setOpen(true);}} title={editingId?'Редактирование рецепта':'Новый рецепт'} busy={busy}>
            {editingId?<EditRecipeForm initialValues={owned.find(r=>r.id===editingId)??null} onSaved={async patch=>{await updateRecipe({id:editingId,patch}).unwrap();closeModal();}} onCancel={closeModal} onBusyChange={setBusy}/>:<AddRecipeForm onSuccess={closeModal} onBusyChange={setBusy}/>}
        </Modal>
    </div>;
}
