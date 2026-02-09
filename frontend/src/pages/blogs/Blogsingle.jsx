import React, { useEffect, useState } from 'react'
import Header from '../../components/header'
import BlogLatest from '../../components/blog/BlogDisplay'
import { FiClock, FiCalendar, FiUser, FiShare2, FiArrowLeft, FiMessageSquare, FiBookmark, FiSend } from 'react-icons/fi'
import { useParams, Link } from 'react-router-dom'

const BlogSingle = () => {
    const { id } = useParams()
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [userName, setUserName] = useState('')

    useEffect(() => {
        document.documentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
        })

        // Load comments from localStorage
        const savedComments = localStorage.getItem(`blog_comments_${id}`)
        if (savedComments) {
            setComments(JSON.parse(savedComments))
        }
    }, [id])

    const handleAddComment = (e) => {
        e.preventDefault()
        if (!newComment.trim() || !userName.trim()) return

        const commentObj = {
            id: Date.now(),
            name: userName,
            text: newComment,
            date: new Date().toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' }),
            avatar: userName.charAt(0).toUpperCase()
        }

        const updatedComments = [commentObj, ...comments]
        setComments(updatedComments)
        localStorage.setItem(`blog_comments_${id}`, JSON.stringify(updatedComments))
        setNewComment('')
        setUserName('')
    }

    // Mock data for the detailed view
    const blogContent = {
        title: id === "trend-1" ? "AI & Machine Learning Adoption in Kigali" :
            id === "trend-2" ? "The Rise of Fintech: Scaling Payment Solutions" :
                "How do you improve your content writing skills?",
        author: "Jordan Smith",
        date: "Feb 10, 2025",
        readTime: "8 min read",
        category: "Technology",
        image: id === "trend-1" ? "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80" :
            "https://images.unsplash.com/photo-1551288049-bbbda536339a?w=1200&q=80"
    };

    return (
        <div className='w-full bg-slate-50 min-h-screen'>
            <Header title="Insight Detail" path="insights / detail" />

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Back Button */}
                <Link to="/insights" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#ff5a00] font-bold mb-10 transition-colors group">
                    <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" /> Back to Insights
                </Link>

                {/* Article Header */}
                <div className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="bg-[#ff5a00]/10 text-[#ff5a00] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                            {blogContent.category}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <FiCalendar /> {blogContent.date}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <FiClock /> {blogContent.readTime}
                        </div>
                    </div>
                    <h1 className='text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8'>
                        {blogContent.title}
                    </h1>
                    <div className="flex items-center justify-between border-y border-slate-200 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500">
                                JS
                            </div>
                            <div>
                                <p className="text-slate-900 font-black">{blogContent.author}</p>
                                <p className="text-slate-400 text-sm">Tech Analyst at Abytech</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:text-[#ff5a00] hover:border-[#ff5a00] transition-all shadow-sm">
                                <FiShare2 />
                            </button>
                            <button className="p-3 bg-white border border-slate-200 rounded-xl hover:text-[#ff5a00] hover:border-[#ff5a00] transition-all shadow-sm">
                                <FiBookmark />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-16 ring-1 ring-slate-200">
                    <img src={blogContent.image} className='w-full h-[500px] object-cover' alt="Featured" />
                </div>

                {/* Article Content */}
                <article className="prose prose-slate prose-lg max-w-none text-slate-600 font-medium leading-relaxed">
                    <p className="text-xl text-slate-900 font-bold mb-8">
                        The technological landscape in Rwanda is evolving at an unprecedented pace. From Kigali's Norrsken Hub to the rural digitalization initiatives, the "Silicon Valley of Africa" is more than just a nickname—it's a burgeoning reality.
                    </p>

                    <p className="mb-6">
                        Rwanda's journey toward becoming a knowledge-based economy has seen significant milestones. The integration of 4G and now 5G networks across the country has laid the foundation for startups to scale beyond borders. However, challenges like talent retention and seed funding remain critical hurdles to overcome.
                    </p>

                    <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">The Scale-Up Challenge</h2>
                    <p className="mb-6">
                        Scaling a tech business in Rwanda requires a dual focus: local relevance and global standards. Startups that succeed are those that solve immediate problems—like Irembo has for government services—while building architectures that can support expansion into the larger East African Community (EAC).
                    </p>

                    <blockquote className="border-l-4 border-[#ff5a00] pl-8 py-4 my-12 bg-white rounded-r-3xl shadow-sm italic text-2xl text-slate-800 font-serif">
                        "Innovation is not just about writing code; it's about understanding the unique pulse of our community and building solutions that resonate with the heart of Rwanda."
                    </blockquote>

                    <h2 className="text-3xl font-black text-slate-900 mt-12 mb-6">Looking Ahead</h2>
                    <p className="mb-6">
                        As we move further into 2025, the focus is shifting toward AI-driven data analytics and sustainable green-tech. Abytech Hub is at the forefront of this shift, ensuring that our partners and clients are equipped with future-proof technologies.
                    </p>
                </article>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mt-16 pt-8 border-t border-slate-200">
                    {['RwandaTech', 'Innovation', 'FutureKigali', 'ScalingUp', 'DigitalRwanda'].map(tag => (
                        <span key={tag} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:border-[#ff5a00] hover:text-[#ff5a00] transition-all cursor-pointer">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Comments Section */}
                <div className="mt-24 space-y-12">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                        Comments <span className="bg-slate-200 text-slate-500 text-sm px-3 py-1 rounded-full">{comments.length}</span>
                    </h2>

                    {/* Comment Form */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <form onSubmit={handleAddComment} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl focus:outline-none focus:border-[#ff5a00] font-bold"
                                />
                            </div>
                            <textarea
                                placeholder="Share your thoughts..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows="4"
                                className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl focus:outline-none focus:border-[#ff5a00] font-medium resize-none"
                            ></textarea>
                            <button type="submit" className="bg-[#ff5a00] text-white px-8 py-4 rounded-xl font-black hover:bg-slate-900 transition-all flex items-center gap-2">
                                Post Comment <FiSend />
                            </button>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-6 p-6 bg-white rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="w-12 h-12 bg-[#ff5a00]/10 text-[#ff5a00] flex items-center justify-center rounded-2xl font-black text-xl shrink-0">
                                        {comment.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-black text-slate-900">{comment.name}</h4>
                                            <span className="text-slate-400 text-xs font-bold uppercase">{comment.date}</span>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No comments yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white py-24">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-4">
                        Related Insights <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                    </h2>
                    <BlogLatest />
                </div>
            </div>
        </div>
    )
}

export default BlogSingle