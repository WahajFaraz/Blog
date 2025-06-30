import moment from 'moment';
import { useSelector } from 'react-redux';

export default function Comment({ comment, onDelete }) {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <div className="flex p-4 border-b dark:border-gray-600 text-sm">
            <div className="flex-shrink-0 mr-3">
                <img
                    className="w-10 h-10 rounded-full bg-gray-200"
                    src={comment.user.profilePic}
                    alt={comment.user.username}
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center mb-1">
                    <span className="font-bold mr-1 text-xs truncate">
                        {comment.user ? `${comment.user.username} : ` : 'anonymous user : '}
                        <p className="text-gray-500 pb-2">{comment.text}</p>
                    </span>
                    <span className="text-gray-500 text-xs">
                        {moment(comment.createdAt).fromNow()}
                    </span>
                </div>
                <div className="flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2">
                    {currentUser &&
                        (currentUser.isAdmin || currentUser._id === comment.user._id) && (
                            <button
                                type="button"
                                onClick={() => onDelete(comment._id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                Delete
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
} 