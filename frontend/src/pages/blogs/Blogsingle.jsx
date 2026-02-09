import React, { useEffect, useState } from 'react'
import Header from '../../components/header'
import { FiClock, FiCalendar, FiUser, FiShare2, FiArrowLeft, FiMessageSquare, FiBookmark, FiSend, FiMapPin, FiBriefcase, FiDollarSign, FiArrowRight } from 'react-icons/fi'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { getInsightItem, getBadgeText, insightsData } from '../../stores/insightsData'

const BlogSingle = () => {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const type = searchParams.get('type') // 'trend', 'event', 'job', 'announcement'

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

    // Fetch dynamic content from the store
    const blogContent = getInsightItem(id, type)

    // Get related insights
    const getRelatedInsights = () => {
        if (!type) return []

        const categoryMap = {
            'trend': 'trends',
            'event': 'events',
            'announcement': 'announcements',
            'job': 'jobs'
        }

        const categoryKey = categoryMap[type]
        const allRelated = []

        // Get items from the same category (excluding current item)
        if (categoryKey && insightsData[categoryKey]) {
            const sameCategory = insightsData[categoryKey].items
                .filter(item => item.id !== id)
                .slice(0, 2)
            allRelated.push(...sameCategory)
        }

        // Get items from other categories to fill up to 3 items
        if (allRelated.length < 3) {
            const otherCategories = Object.keys(categoryMap)
                .filter(t => t !== type)
                .map(t => categoryMap[t])

            for (const cat of otherCategories) {
                if (allRelated.length >= 3) break
                if (insightsData[cat] && insightsData[cat].items.length > 0) {
                    allRelated.push(insightsData[cat].items[0])
                }
            }
        }

        return allRelated.slice(0, 3)
    }

    const relatedInsights = getRelatedInsights()

    // If content not found, show error
    if (!blogContent) {
        return (
            <div className='w-full bg-slate-50 min-h-screen'>
                <Header title="Content Not Found" path="insights / error" />
                <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-4">Content Not Found</h1>
                    <p className="text-slate-600 mb-8">The content you're looking for doesn't exist or has been removed.</p>
                    <Link to="/insights" className="inline-flex items-center gap-2 text-[#ff5a00] hover:text-slate-900 font-bold transition-colors">
                        <FiArrowLeft /> Back to Insights
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full bg-slate-50 min-h-screen text-black'>
            <Header title="Insight Detail" path="insights / detail" />

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Back Button */}
                <Link to="/insights" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#ff5a00] font-bold mb-10 transition-colors group">
                    <FiArrowLeft className="group-hover:-translate-x-2 transition-transform" /> Back to Insights
                </Link>

                {/* Article Header */}
                <div className="mb-12">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="bg-[#ff5a00]/10 text-[#ff5a00] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                            {getBadgeText(type)}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <FiCalendar /> {blogContent.date}
                        </div>
                        {blogContent.readTime && (
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                <FiClock /> {blogContent.readTime}
                            </div>
                        )}
                        {type === 'event' && blogContent.location && (
                            <div className="flex items-center gap-2 text-[#ff5a00] text-sm font-bold">
                                <FiMapPin /> {blogContent.location}
                            </div>
                        )}
                    </div>
                    <h1 className='text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8'>
                        {blogContent.title}
                    </h1>

                    {/* Type-specific metadata */}
                    <div className="flex items-center justify-between border-y border-slate-200 py-6">
                        <div className="flex items-center gap-4">
                            {type === 'trend' && blogContent.author && (
                                <>
                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500">
                                        {blogContent.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-black">{blogContent.author}</p>
                                        <p className="text-slate-400 text-sm">Tech Analyst at Abytech</p>
                                    </div>
                                </>
                            )}
                            {type === 'event' && blogContent.organizer && (
                                <>
                                    <div className="w-12 h-12 bg-[#ff5a00]/10 rounded-full flex items-center justify-center font-black text-[#ff5a00]">
                                        <FiCalendar />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-black">Organized by</p>
                                        <p className="text-slate-400 text-sm">{blogContent.organizer}</p>
                                    </div>
                                </>
                            )}
                            {type === 'job' && (
                                <>
                                    <div className="w-12 h-12 bg-[#ff5a00]/10 rounded-full flex items-center justify-center font-black text-[#ff5a00]">
                                        <FiBriefcase />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-black">{blogContent.jobType}</p>
                                        <p className="text-slate-400 text-sm">{blogContent.location}</p>
                                    </div>
                                </>
                            )}
                            {type === 'announcement' && (
                                <>
                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500">
                                        AT
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-black">Abytech Hub</p>
                                        <p className="text-slate-400 text-sm">Official Announcement</p>
                                    </div>
                                </>
                            )}
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
                    <img
                        src={blogContent.image || 'https://via.placeholder.com/1200x500/f1f5f9/64748b?text=No+Image+Available'}
                        className='w-full h-[500px] object-cover'
                        alt={blogContent.title}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/1200x500/f1f5f9/64748b?text=Image+Not+Found';
                        }}
                    />
                </div>

                {/* Job-specific details (before main content) */}
                {type === 'job' && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <FiBriefcase className="text-[#ff5a00]" />
                                <span className="text-slate-400 text-sm font-bold">Job Type</span>
                            </div>
                            <p className="text-slate-900 font-black">{blogContent.jobType}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-2">
                                <FiMapPin className="text-[#ff5a00]" />
                                <span className="text-slate-400 text-sm font-bold">Location</span>
                            </div>
                            <p className="text-slate-900 font-black">{blogContent.location}</p>
                        </div>
                        {blogContent.salary && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <FiDollarSign className="text-[#ff5a00]" />
                                    <span className="text-slate-400 text-sm font-bold">Salary</span>
                                </div>
                                <p className="text-slate-900 font-black">{blogContent.salary}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Event-specific details (before main content) */}
                {type === 'event' && blogContent.attendees && (
                    <div className="bg-gradient-to-r from-[#ff5a00]/10 to-slate-100 p-8 rounded-3xl mb-12 border border-[#ff5a00]/20">
                        <div className="flex flex-wrap gap-8 items-center justify-center">
                            <div className="text-center">
                                <p className="text-3xl font-black text-[#ff5a00] mb-1">{blogContent.attendees}</p>
                                <p className="text-slate-600 font-bold">Attendees</p>
                            </div>
                            <div className="h-12 w-px bg-slate-300"></div>
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-900 mb-1">{blogContent.location}</p>
                                <p className="text-slate-600 font-bold">Venue</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Article Content */}
                <article className="prose prose-slate prose-lg max-w-none text-slate-900 font-medium leading-relaxed">
                    {blogContent.fullContent ? (
                        <div dangerouslySetInnerHTML={{ __html: blogContent.fullContent }} />
                    ) : (
                        <p className="text-xl text-black font-bold mb-8">
                            {blogContent.excerpt}
                        </p>
                    )}
                </article>

                {/* Job Apply Button */}
                {type === 'job' && (
                    <div className="mt-12 p-8 bg-gradient-to-r from-[#ff5a00] to-slate-900 rounded-3xl text-white text-center">
                        <h3 className="text-2xl font-black mb-4">Interested in this position?</h3>
                        <p className="mb-6 text-white/80">Join our team and be part of Rwanda's tech revolution</p>
                        <button className="bg-white text-[#ff5a00] px-10 py-4 rounded-xl font-black hover:bg-slate-100 transition-all">
                            Apply Now
                        </button>
                    </div>
                )}

                {/* Tags */}
                {blogContent.tags && blogContent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-16 pt-8 border-t border-slate-200">
                        {blogContent.tags.map(tag => (
                            <span key={tag} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:border-[#ff5a00] hover:text-[#ff5a00] transition-all cursor-pointer">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

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

            {/* Related Insights Section */}
            <div className="bg-white py-24">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                            Related Insights <div className="h-1 w-24 bg-[#ff5a00] rounded-full"></div>
                        </h2>
                        <Link to="/insights" className="text-[#ff5a00] font-black hover:text-slate-900 transition-colors flex items-center gap-2">
                            View All <FiArrowRight />
                        </Link>
                    </div>

                    {relatedInsights.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {relatedInsights.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/blog/${item.id}?type=${item.type}`}
                                    className="group bg-slate-50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-[#ff5a00]/30"
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/400x300/f1f5f9/64748b?text=No+Image'}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <span className="inline-block bg-[#ff5a00]/10 text-[#ff5a00] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                                            {getBadgeText(item.type)}
                                        </span>
                                        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-[#ff5a00] transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                            {item.excerpt}
                                        </p>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                            <FiCalendar className="w-3 h-3" />
                                            {item.date}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No related insights available at the moment.</p>
                            <Link to="/insights" className="inline-block mt-4 text-[#ff5a00] font-black hover:text-slate-900 transition-colors">
                                Explore All Insights
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BlogSingle