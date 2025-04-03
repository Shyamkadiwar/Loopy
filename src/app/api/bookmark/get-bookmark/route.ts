import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not authenticated",
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const user_id = session.user.id;
        
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                user_id,
            }
        });
        
        const snippetItems: any[] = [];
        const postItems: any[] = [];
        const questionItems: any[] = [];
        const articleItems: any[] = [];
        
        const snippetIds: string[] = [];
        const postIds: string[] = [];
        const questionIds: string[] = [];
        const articleIds: string[] = [];
        
        bookmarks.forEach(bookmark => {
            if (bookmark.bookmarkable_type === "snippet") {
                snippetIds.push(bookmark.bookmarkable_id);
            } else if (bookmark.bookmarkable_type === "post") {
                postIds.push(bookmark.bookmarkable_id);
            } else if (bookmark.bookmarkable_type === "question") {
                questionIds.push(bookmark.bookmarkable_id);
            } else if (bookmark.bookmarkable_type === "article") {
                articleIds.push(bookmark.bookmarkable_id);
            }
        });
        
        if (snippetIds.length > 0) {
            const snippets = await prisma.snippet.findMany({
                where: {
                    id: { in: snippetIds }
                },
                include: {
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
            
            snippetItems.push(...snippets.map(snippet => ({
                id: snippet.id,
                title: snippet.title,
                description: snippet.description,
                code: snippet.code,
                created_at: snippet.created_at.toISOString(),
                tags: snippet.tags.map(t => t.tag.name),
                _count: {
                    comments: 0
                }
            })));
            
            const snippetComments = await prisma.comment.groupBy({
                by: ['snippetId'],
                where: {
                    snippetId: {
                        in: snippetIds
                    }
                },
                _count: {
                    snippetId: true
                }
            });
            
            snippetComments.forEach(sc => {
                const snippet = snippetItems.find(s => s.id === sc.snippetId);
                if (snippet) {
                    snippet._count.comments = sc._count.snippetId;
                }
            });
        }
        
        if (postIds.length > 0) {
            const posts = await prisma.post.findMany({
                where: {
                    id: { in: postIds }
                }
            });
            
            postItems.push(...posts.map(post => ({
                id: post.id,
                description: post.description,
                created_at: post.created_at.toISOString(),
                _count: {
                    comments: 0,
                    votes: 0
                }
            })));
            
            const postComments = await prisma.comment.groupBy({
                by: ['postId'],
                where: {
                    postId: {
                        in: postIds
                    }
                },
                _count: {
                    postId: true
                }
            });
            
            postComments.forEach(pc => {
                const post = postItems.find(p => p.id === pc.postId);
                if (post) {
                    post._count.comments = pc._count.postId;
                }
            });
            
            const postVotes = await prisma.vote.groupBy({
                by: ['postId'],
                where: {
                    postId: {
                        in: postIds
                    }
                },
                _count: {
                    postId: true
                }
            });
            
            postVotes.forEach(pv => {
                const post = postItems.find(p => p.id === pv.postId);
                if (post) {
                    post._count.votes = pv._count.postId;
                }
            });
        }
        
        if (questionIds.length > 0) {
            const questions = await prisma.question.findMany({
                where: {
                    id: { in: questionIds }
                }
            });
            
            questionItems.push(...questions.map(question => ({
                id: question.id,
                title: question.title,
                description: question.description,
                created_at: question.created_at.toISOString(),
                _count: {
                    comments: 0,
                    answers: 0
                }
            })));
            
            const questionComments = await prisma.comment.groupBy({
                by: ['questionId'],
                where: {
                    questionId: {
                        in: questionIds
                    }
                },
                _count: {
                    questionId: true
                }
            });
            
            questionComments.forEach(qc => {
                const question = questionItems.find(q => q.id === qc.questionId);
                if (question) {
                    question._count.comments = qc._count.questionId;
                }
            });
        
            const questionAnswers = await prisma.answer.groupBy({
                by: ['question_id'],
                where: {
                    question_id: {
                        in: questionIds
                    }
                },
                _count: {
                    question_id: true
                }
            });
            
            questionAnswers.forEach(qa => {
                const question = questionItems.find(q => q.id === qa.question_id);
                if (question) {
                    question._count.answers = qa._count.question_id;
                }
            });
        }
        
        if (articleIds.length > 0) {
            const articles = await prisma.article.findMany({
                where: {
                    id: { in: articleIds }
                }
            });
            
            articleItems.push(...articles.map(article => ({
                id: article.id,
                title: article.title,
                description: article.description,
                created_at: article.created_at.toISOString(),
                _count: {
                    comments: 0,
                    votes: 0
                }
            })));
            
            const articleComments = await prisma.comment.groupBy({
                by: ['articleId'],
                where: {
                    articleId: {
                        in: articleIds
                    }
                },
                _count: {
                    articleId: true
                }
            });
            
            articleComments.forEach(ac => {
                const article = articleItems.find(a => a.id === ac.articleId);
                if (article) {
                    article._count.comments = ac._count.articleId;
                }
            });
            
            const articleVotes = await prisma.vote.groupBy({
                by: ['articleId'],
                where: {
                    articleId: {
                        in: articleIds
                    }
                },
                _count: {
                    articleId: true
                }
            });
            
            articleVotes.forEach(av => {
                const article = articleItems.find(a => a.id === av.articleId);
                if (article) {
                    article._count.votes = av._count.articleId;
                }
            });
        }
        
        const formattedData = {
            snippets: snippetItems,
            posts: postItems,
            questions: questionItems,
            articles: articleItems
        };

        return new Response(
            JSON.stringify({
                success: true,
                message: "Bookmarks retrieved successfully",
                data: formattedData
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error retrieving bookmarks:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Failed to retrieve bookmarks",
                error: error instanceof Error ? error.message : String(error)
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}